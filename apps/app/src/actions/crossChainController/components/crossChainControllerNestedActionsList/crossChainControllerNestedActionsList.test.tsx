import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    type IProposalAction,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import { actionViewRegistry } from '@/shared/utils/actionViewRegistry';
import {
    CrossChainControllerNestedActionsList,
    type ICrossChainControllerNestedActionsListProps,
} from './crossChainControllerNestedActionsList';

describe('<CrossChainControllerNestedActionsList /> component', () => {
    const normalizeDefaultActionSpy = jest.spyOn(
        proposalActionUtils,
        'normalizeDefaultAction',
    );

    const getViewByActionTypeSpy = jest.spyOn(
        actionViewRegistry,
        'getViewByActionType',
    );

    afterEach(() => {
        normalizeDefaultActionSpy.mockClear();
        getViewByActionTypeSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ICrossChainControllerNestedActionsListProps>,
    ) => {
        const completeProps: ICrossChainControllerNestedActionsListProps = {
            rawTuple: [],
            rawActions: [],
            chainId: 42_161,
            ...props,
        };

        return (
            <GukModulesProvider>
                <CrossChainControllerNestedActionsList {...completeProps} />
            </GukModulesProvider>
        );
    };

    const generateAction = (
        overrides?: Partial<IProposalAction>,
    ): IProposalAction => ({
        type: 'Unknown',
        from: '0x0',
        to: '0xa0Ab554dEa45be64F12E3B0085DDC59852eFF9fc',
        data: '0xd09de08a',
        value: '0',
        inputData: null,
        ...overrides,
    });

    it('renders one item per decoded sub-action without resolving a custom action view', () => {
        const rawActions = [
            generateAction({ to: '0xa' }),
            generateAction({ to: '0xb' }),
        ];

        render(
            createTestComponent({
                rawTuple: [
                    { to: '0xa', value: '0', data: '0x' },
                    { to: '0xb', value: '0', data: '0x' },
                ],
                rawActions,
            }),
        );

        expect(screen.getByText('0xa')).toBeInTheDocument();
        expect(screen.getByText('0xb')).toBeInTheDocument();
    });

    it('falls back to raw-calldata stubs when the decoded length disagrees with the tuple', () => {
        render(
            createTestComponent({
                rawTuple: [
                    { to: '0xa', value: '0', data: '0x' },
                    { to: '0xb', value: '0', data: '0x' },
                ],
                rawActions: [generateAction()],
            }),
        );

        expect(screen.getByText('0xa')).toBeInTheDocument();
        expect(screen.getByText('0xb')).toBeInTheDocument();
    });

    it('runs each rendered action through the default normalization function', () => {
        const rawActions = [generateAction()];

        render(
            createTestComponent({
                rawTuple: [
                    {
                        to: '0xa0Ab554dEa45be64F12E3B0085DDC59852eFF9fc',
                        value: '0',
                        data: '0xd09de08a',
                    },
                ],
                rawActions,
            }),
        );

        expect(normalizeDefaultActionSpy).toHaveBeenCalledWith(rawActions[0]);
    });

    it.each([ProposalActionType.TRANSFER, ProposalActionType.TRANSFER_NATIVE])(
        'renders the view registered for %s actions',
        async (type) => {
            getViewByActionTypeSpy.mockReturnValue({
                actionType: type,
                componentDetails: () => 'transfer-view',
            });
            const action = generateAction({ type, data: '0x', value: '1' });

            render(
                createTestComponent({
                    rawTuple: [{ to: action.to, value: '1', data: '0x' }],
                    rawActions: [action],
                }),
            );

            await userEvent.click(screen.getAllByRole('button')[0]);

            expect(getViewByActionTypeSpy).toHaveBeenCalledWith(type);
            expect(screen.getByText('transfer-view')).toBeInTheDocument();
        },
    );

    it('does not resolve views by action type for other actions', () => {
        const action = generateAction({ type: 'Execute' });

        render(
            createTestComponent({
                rawTuple: [{ to: action.to, value: '0', data: action.data }],
                rawActions: [action],
            }),
        );

        expect(getViewByActionTypeSpy).not.toHaveBeenCalled();
    });

    it('renders nothing when both rawActions and rawTuple are empty', () => {
        const { container } = render(
            createTestComponent({ rawTuple: [], rawActions: undefined }),
        );

        expect(container).toBeEmptyDOMElement();
    });
});

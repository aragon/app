import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateReactQueryResultSuccess,
    generateReactQueryResultSuccessWithData,
} from '@/shared/testUtils';
import {
    type INestedActionsListProps,
    NestedActionsList,
} from './nestedActionsList';

jest.mock('../proposalActionsItem', () => ({
    ProposalActionsItem: ({ action }: { action: IProposalAction }) => (
        <div data-testid="nested-item">{action.type}</div>
    ),
}));

describe('<NestedActionsList /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const normalizeActionsSpy = jest.spyOn(
        proposalActionUtils,
        'normalizeActions',
    );

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        normalizeActionsSpy.mockImplementation((actions) => actions);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        normalizeActionsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<INestedActionsListProps>) => {
        const completeProps: INestedActionsListProps = {
            outerParams: [],
            rawActions: [],
            daoId: 'dao-id',
            chainId: 1,
            ...props,
        };

        return (
            <GukModulesProvider>
                <NestedActionsList {...completeProps} />
            </GukModulesProvider>
        );
    };

    const generateAction = (
        overrides?: Partial<IProposalAction>,
    ): IProposalAction => ({
        type: 'CustomAction',
        from: '0x0',
        to: '0x1',
        data: '0x',
        value: '0',
        inputData: null,
        ...overrides,
    });

    const firstTarget = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const secondTarget = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

    const outerParams = (value: unknown[]) => [
        { name: '_actions', type: 'tuple[]', value },
    ];

    it('renders one item per decoded sub-action when they match the outer tuple', () => {
        const rawActions = [
            generateAction({ type: 'Foo', to: firstTarget }),
            generateAction({ type: 'Bar', to: secondTarget }),
        ];

        render(
            createTestComponent({
                outerParams: outerParams([
                    { to: firstTarget, value: '0', data: '0x' },
                    { to: secondTarget, value: '0', data: '0x' },
                ]),
                rawActions,
            }),
        );

        const items = screen.getAllByTestId('nested-item');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent('Foo');
        expect(items[1]).toHaveTextContent('Bar');
    });

    it('falls back to raw-calldata stubs when decoded length disagrees with the outer tuple', () => {
        render(
            createTestComponent({
                outerParams: outerParams([
                    { to: firstTarget, value: '0', data: '0x' },
                    { to: secondTarget, value: '0', data: '0x' },
                    { to: firstTarget, value: '0', data: '0x' },
                ]),
                rawActions: [generateAction({ to: firstTarget })],
            }),
        );

        const items = screen.getAllByTestId('nested-item');
        expect(items).toHaveLength(3);
        items.forEach((item) => {
            expect(item).toHaveTextContent('RAW_CALLDATA');
        });
    });

    it('falls back to raw-calldata stubs when a decoded sub-action targets a different address than the tuple', () => {
        render(
            createTestComponent({
                outerParams: outerParams([
                    { to: firstTarget, value: '0', data: '0x' },
                ]),
                rawActions: [generateAction({ type: 'Foo', to: secondTarget })],
            }),
        );

        expect(screen.getByTestId('nested-item')).toHaveTextContent(
            'RAW_CALLDATA',
        );
    });

    it('renders nothing while the DAO is loading', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(
                undefined,
            ) as unknown as ReturnType<typeof daoService.useDao>,
        );
        const { container } = render(
            createTestComponent({
                outerParams: outerParams([
                    { to: firstTarget, value: '0', data: '0x' },
                ]),
                rawActions: [generateAction({ to: firstTarget })],
            }),
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders nothing when both rawActions and the outer tuple are empty', () => {
        const { container } = render(
            createTestComponent({ outerParams: [], rawActions: undefined }),
        );
        expect(container).toBeEmptyDOMElement();
    });
});

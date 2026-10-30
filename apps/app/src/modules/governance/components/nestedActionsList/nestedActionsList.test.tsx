import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import * as UseNormalizedProposalActions from '../../hooks/useNormalizedProposalActions';
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
    const useNormalizedProposalActionsSpy = jest.spyOn(
        UseNormalizedProposalActions,
        'useNormalizedProposalActions',
    );

    beforeEach(() => {
        useNormalizedProposalActionsSpy.mockImplementation(
            ({ actions }) => actions,
        );
    });

    afterEach(() => {
        useNormalizedProposalActionsSpy.mockReset();
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

    it('renders the decoded sub-actions when the outer tuple holds positional [to, value, data] entries', () => {
        // Shape returned by the backend for the `_actions` parameter (APP-1347): proposal ADMIN-7 of the Sepolia QA
        // fixture DAO, a createProposal action wrapping a DAO setMetadata call.
        const dao = '0x29f2Ae55E58bC08f72bBc2a96B320FF654CeE090';
        const setMetadataData =
            '0xee57e36f00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000035697066733a2f2f516d5070654244674179724e626b417a7964704157796370594867366d7a4a696263756e763944657962467748360000000000000000000000';
        const rawActions = [
            generateAction({
                type: 'MetadataUpdate',
                from: dao,
                to: dao,
                data: setMetadataData,
            }),
        ];

        render(
            createTestComponent({
                outerParams: outerParams([[dao, '0', setMetadataData]]),
                rawActions,
            }),
        );

        expect(screen.getByTestId('nested-item')).toHaveTextContent(
            'MetadataUpdate',
        );
    });

    it('falls back to raw-calldata stubs carrying the tuple calls when positional entries do not match', () => {
        render(
            createTestComponent({
                outerParams: outerParams([[firstTarget, '5', '0xabcd']]),
                rawActions: [generateAction({ type: 'Foo', to: secondTarget })],
            }),
        );

        expect(screen.getByTestId('nested-item')).toHaveTextContent(
            'RAW_CALLDATA',
        );
        expect(useNormalizedProposalActionsSpy).toHaveBeenCalledWith({
            actions: [
                expect.objectContaining({
                    to: firstTarget,
                    value: '5',
                    data: '0xabcd',
                }),
            ],
            daoId: 'dao-id',
        });
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

    it('renders nothing when both rawActions and the outer tuple are empty', () => {
        const { container } = render(
            createTestComponent({ outerParams: [], rawActions: undefined }),
        );
        expect(container).toBeEmptyDOMElement();
    });
});

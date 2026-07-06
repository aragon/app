import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { useDecodeTransactionsLight } from '@/modules/governance/api/smartContractService';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import { proposalActionUtils } from '@/modules/governance/utils/proposalActionUtils';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateReactQueryResultError,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
    generateReactQueryResultSuccessWithData,
} from '@/shared/testUtils';
import {
    type INestedActionsListProps,
    NestedActionsList,
} from './nestedActionsList';

jest.mock('../proposalActionsItem', () => ({
    ProposalActionsItem: ({ action }: { action: IProposalAction }) => (
        <div
            data-data={action.data}
            data-testid="nested-item"
            data-to={action.to}
            data-value={action.value}
        >
            {action.type}
        </div>
    ),
}));

jest.mock('@/modules/governance/api/smartContractService', () => ({
    useDecodeTransactionsLight: jest.fn(),
}));

describe('<NestedActionsList /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const normalizeActionsSpy = jest.spyOn(
        proposalActionUtils,
        'normalizeActions',
    );
    const useDecodeTransactionsLightMock = jest.mocked(
        useDecodeTransactionsLight,
    );

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        normalizeActionsSpy.mockImplementation((actions) => actions);
        useDecodeTransactionsLightMock.mockReturnValue(
            generateReactQueryResultSuccessWithData([]) as ReturnType<
                typeof useDecodeTransactionsLight
            >,
        );
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        normalizeActionsSpy.mockReset();
        useDecodeTransactionsLightMock.mockReset();
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

    it('renders one item per decoded sub-action when length matches the outer tuple', () => {
        const rawActions = [
            generateAction({ type: 'Foo' }),
            generateAction({ type: 'Bar' }),
        ];

        render(
            createTestComponent({
                outerParams: [
                    {
                        name: '_actions',
                        type: 'tuple[]',
                        value: [
                            { to: '0xa', value: '0', data: '0x' },
                            { to: '0xb', value: '0', data: '0x' },
                        ],
                    },
                ],
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
                outerParams: [
                    {
                        name: '_actions',
                        type: 'tuple[]',
                        value: [
                            { to: '0xa', value: '0', data: '0x' },
                            { to: '0xb', value: '0', data: '0x' },
                            { to: '0xc', value: '0', data: '0x' },
                        ],
                    },
                ],
                rawActions: [generateAction()],
            }),
        );

        const items = screen.getAllByTestId('nested-item');
        expect(items).toHaveLength(3);
        items.forEach((item) => {
            expect(item).toHaveTextContent('RAW_CALLDATA');
        });
    });

    it('normalizes positional tuple arrays when building raw-calldata stubs', () => {
        render(
            createTestComponent({
                outerParams: [
                    {
                        name: '_actions',
                        type: 'tuple[]',
                        components: [
                            { name: 'to', type: 'address' },
                            { name: 'value', type: 'uint256' },
                            { name: 'data', type: 'bytes' },
                        ],
                        value: [
                            [
                                '0x1Fc37B93680329C523515AEd5eFeFB51Bb87B5eF',
                                '15',
                                '0x8ab56883',
                            ],
                        ],
                    },
                ],
                rawActions: undefined,
            }),
        );

        const item = screen.getByTestId('nested-item');

        expect(item).toHaveTextContent('RAW_CALLDATA');
        expect(item).toHaveAttribute(
            'data-to',
            '0x1Fc37B93680329C523515AEd5eFeFB51Bb87B5eF',
        );
        expect(item).toHaveAttribute('data-value', '15');
        expect(item).toHaveAttribute('data-data', '0x8ab56883');
    });

    it('uses decoded fallback actions when backend decoded actions are missing', () => {
        const decodedAction = generateAction({
            type: 'DecodedAction',
            to: '0xdecoded',
            data: '0xdecoded-data',
            value: '99',
        });
        useDecodeTransactionsLightMock.mockReturnValue(
            generateReactQueryResultSuccessWithData([decodedAction]) as ReturnType<
                typeof useDecodeTransactionsLight
            >,
        );

        render(
            createTestComponent({
                outerParams: [
                    {
                        name: '_actions',
                        type: 'tuple[]',
                        value: [
                            {
                                to: '0xraw',
                                value: '0',
                                data: '0xraw-data',
                            },
                        ],
                    },
                ],
                rawActions: undefined,
            }),
        );

        const item = screen.getByTestId('nested-item');

        expect(useDecodeTransactionsLightMock).toHaveBeenCalledWith(
            expect.objectContaining({
                body: [{ to: '0xraw', value: '0', data: '0xraw-data' }],
            }),
            expect.objectContaining({ enabled: true }),
        );
        expect(item).toHaveTextContent('DecodedAction');
        expect(item).toHaveAttribute('data-to', '0xdecoded');
        expect(item).toHaveAttribute('data-value', '99');
        expect(item).toHaveAttribute('data-data', '0xdecoded-data');
    });

    it('keeps raw-calldata stubs while decoded fallback actions are loading', () => {
        useDecodeTransactionsLightMock.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof useDecodeTransactionsLight
            >,
        );

        render(
            createTestComponent({
                outerParams: [
                    {
                        name: '_actions',
                        type: 'tuple[]',
                        value: [
                            {
                                to: '0xraw',
                                value: '0',
                                data: '0xraw-data',
                            },
                        ],
                    },
                ],
                rawActions: undefined,
            }),
        );

        const item = screen.getByTestId('nested-item');

        expect(item).toHaveTextContent('RAW_CALLDATA');
        expect(item).toHaveAttribute('data-to', '0xraw');
    });

    it('keeps raw-calldata stubs when decoded fallback actions fail', () => {
        useDecodeTransactionsLightMock.mockReturnValue(
            generateReactQueryResultError() as ReturnType<
                typeof useDecodeTransactionsLight
            >,
        );

        render(
            createTestComponent({
                outerParams: [
                    {
                        name: '_actions',
                        type: 'tuple[]',
                        value: [
                            {
                                to: '0xraw',
                                value: '0',
                                data: '0xraw-data',
                            },
                        ],
                    },
                ],
                rawActions: undefined,
            }),
        );

        const item = screen.getByTestId('nested-item');

        expect(item).toHaveTextContent('RAW_CALLDATA');
        expect(item).toHaveAttribute('data-to', '0xraw');
    });

    it('renders nothing while the DAO is loading', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(
                undefined,
            ) as unknown as ReturnType<typeof daoService.useDao>,
        );
        const { container } = render(
            createTestComponent({
                outerParams: [
                    {
                        name: '_actions',
                        type: 'tuple[]',
                        value: [{ to: '0xa', value: '0', data: '0x' }],
                    },
                ],
                rawActions: [generateAction()],
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

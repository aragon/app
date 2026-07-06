import {
    GukModulesProvider,
    type IProposalActionInputDataParameter,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import * as smartContractService from '@/modules/governance/api/smartContractService';
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

describe('<NestedActionsList /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const normalizeActionsSpy = jest.spyOn(
        proposalActionUtils,
        'normalizeActions',
    );
    const useDecodeTransactionsLightSpy = jest.spyOn(
        smartContractService,
        'useDecodeTransactionsLight',
    );

    beforeEach(() => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: generateDao() }),
        );
        normalizeActionsSpy.mockImplementation((actions) => actions);
        useDecodeTransactionsLightSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData([]) as ReturnType<
                typeof smartContractService.useDecodeTransactionsLight
            >,
        );
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        normalizeActionsSpy.mockReset();
        useDecodeTransactionsLightSpy.mockReset();
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

    const generateActionsParams = (
        value: unknown[],
        name = '_actions',
    ): IProposalActionInputDataParameter[] => [{ name, type: 'tuple[]', value }];

    it('renders one item per decoded sub-action when length matches the outer tuple', () => {
        const rawActions = [
            generateAction({ type: 'Foo' }),
            generateAction({ type: 'Bar' }),
        ];

        render(
            createTestComponent({
                outerParams: generateActionsParams([
                    { to: '0xa', value: '0', data: '0x' },
                    { to: '0xb', value: '0', data: '0x' },
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
                outerParams: generateActionsParams([
                    { to: '0xa', value: '0', data: '0x' },
                    { to: '0xb', value: '0', data: '0x' },
                    { to: '0xc', value: '0', data: '0x' },
                ]),
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
                outerParams: generateActionsParams([
                    [
                        '0x1Fc37B93680329C523515AEd5eFeFB51Bb87B5eF',
                        '15',
                        '0x8ab56883',
                    ],
                ]),
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

    it('reads the raw tuple from the first tuple[] parameter when it is not named _actions', () => {
        render(
            createTestComponent({
                outerParams: generateActionsParams(
                    [{ to: '0xa', value: '0', data: '0x12345678' }],
                    'actions',
                ),
                rawActions: undefined,
            }),
        );

        const item = screen.getByTestId('nested-item');

        expect(item).toHaveTextContent('RAW_CALLDATA');
        expect(item).toHaveAttribute('data-to', '0xa');
    });

    it('uses decoded fallback actions when backend decoded actions are missing', () => {
        const decodedAction = generateAction({
            type: 'DecodedAction',
            to: '0xdecoded',
            data: '0xdecoded-data',
            value: '99',
        });
        useDecodeTransactionsLightSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData([
                decodedAction,
            ]) as ReturnType<
                typeof smartContractService.useDecodeTransactionsLight
            >,
        );

        render(
            createTestComponent({
                outerParams: generateActionsParams([
                    { to: '0xraw', value: '0', data: '0xraw-data' },
                ]),
                rawActions: undefined,
            }),
        );

        const item = screen.getByTestId('nested-item');

        expect(useDecodeTransactionsLightSpy).toHaveBeenCalledWith(
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
        useDecodeTransactionsLightSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof smartContractService.useDecodeTransactionsLight
            >,
        );

        render(
            createTestComponent({
                outerParams: generateActionsParams([
                    { to: '0xraw', value: '0', data: '0xraw-data' },
                ]),
                rawActions: undefined,
            }),
        );

        const item = screen.getByTestId('nested-item');

        expect(item).toHaveTextContent('RAW_CALLDATA');
        expect(item).toHaveAttribute('data-to', '0xraw');
    });

    it('keeps raw-calldata stubs when decoded fallback actions fail', () => {
        useDecodeTransactionsLightSpy.mockReturnValue(
            generateReactQueryResultError() as ReturnType<
                typeof smartContractService.useDecodeTransactionsLight
            >,
        );

        render(
            createTestComponent({
                outerParams: generateActionsParams([
                    { to: '0xraw', value: '0', data: '0xraw-data' },
                ]),
                rawActions: undefined,
            }),
        );

        const item = screen.getByTestId('nested-item');

        expect(item).toHaveTextContent('RAW_CALLDATA');
        expect(item).toHaveAttribute('data-to', '0xraw');
    });

    it('remounts nested items when decoded fallback actions replace the raw-calldata stubs', () => {
        useDecodeTransactionsLightSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof smartContractService.useDecodeTransactionsLight
            >,
        );
        const listProps: Partial<INestedActionsListProps> = {
            outerParams: generateActionsParams([
                { to: '0xraw', value: '0', data: '0xraw-data' },
            ]),
            rawActions: undefined,
        };

        const { rerender } = render(createTestComponent(listProps));
        const stubItem = screen.getByTestId('nested-item');
        expect(stubItem).toHaveTextContent('RAW_CALLDATA');

        useDecodeTransactionsLightSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData([
                generateAction({ type: 'DecodedAction' }),
            ]) as ReturnType<
                typeof smartContractService.useDecodeTransactionsLight
            >,
        );
        rerender(createTestComponent(listProps));

        // A new DOM node proves the item remounted, re-initializing its default view mode to the decoded view.
        const decodedItem = screen.getByTestId('nested-item');
        expect(decodedItem).toHaveTextContent('DecodedAction');
        expect(decodedItem).not.toBe(stubItem);
    });

    it('renders nothing while the DAO is loading', () => {
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(
                undefined,
            ) as unknown as ReturnType<typeof daoService.useDao>,
        );
        const { container } = render(
            createTestComponent({
                outerParams: generateActionsParams([
                    { to: '0xa', value: '0', data: '0x' },
                ]),
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

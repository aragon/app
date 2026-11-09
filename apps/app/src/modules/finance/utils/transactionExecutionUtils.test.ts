import { ProposalActionTypeNoBasicView } from '@aragon/gov-ui-kit';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import {
    type ITransactionActionsResult,
    TransactionSide,
    type TransactionTransferSide,
} from '../api/financeService';
import { generateTransaction } from '../testUtils';
import { transactionExecutionUtils } from './transactionExecutionUtils';

const generateActionData = (
    values: Partial<ITransactionActionsResult> = {},
): ITransactionActionsResult => ({
    actionCount: 1,
    actions: [],
    blockTimestamp: 1_700_000_000,
    decoding: false,
    transactionHash: '0xabc',
    ...values,
});

describe('transactionExecutionUtils', () => {
    describe('getActionsRefetchInterval', () => {
        it('polls while action decoding is pending', () => {
            const result = transactionExecutionUtils.getActionsRefetchInterval({
                state: {
                    data: generateActionData({ decoding: true }),
                    dataUpdateCount: 1,
                },
            });

            expect(result).toBe(2000);
        });

        it('stops polling after ten successful responses', () => {
            const result = transactionExecutionUtils.getActionsRefetchInterval({
                state: {
                    data: generateActionData({ decoding: true }),
                    dataUpdateCount: 10,
                },
            });

            expect(result).toBe(false);
        });

        it('does not poll when decoding has completed', () => {
            const result = transactionExecutionUtils.getActionsRefetchInterval({
                state: {
                    data: generateActionData(),
                    dataUpdateCount: 1,
                },
            });

            expect(result).toBe(false);
        });
    });

    describe('resolveActions', () => {
        const to = '0xE5e5f0c2e1B5F1b8f2C0a1D3a4B5c6D7e8F90123';

        const action = {
            from: '0xfrom',
            to,
            data: '0x',
            value: '0',
            type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
            inputData: null,
        };

        it('returns decoded actions when they match the raw calldata', () => {
            expect(
                transactionExecutionUtils.resolveActions(
                    generateActionData({
                        actions: [action],
                        rawActions: [{ to, data: '0x', value: '0' }],
                    }),
                    '0xexecutor',
                ),
            ).toEqual([action]);
        });

        it('falls back to raw calldata when decoding is incomplete', () => {
            expect(
                transactionExecutionUtils.resolveActions(
                    generateActionData({
                        decoding: true,
                        rawActions: [{ to, data: '0x1234', value: '5' }],
                    }),
                    '0xexecutor',
                ),
            ).toEqual([
                {
                    from: '0xexecutor',
                    to,
                    data: '0x1234',
                    value: '5',
                    type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
                    inputData: null,
                },
            ]);
        });

        it('falls back to raw calldata when a decoded action differs from its raw counterpart', () => {
            expect(
                transactionExecutionUtils.resolveActions(
                    generateActionData({
                        actions: [action],
                        rawActions: [{ to, data: '0x', value: '100' }],
                    }),
                    '0xexecutor',
                ),
            ).toEqual([
                {
                    from: '0xexecutor',
                    to,
                    data: '0x',
                    value: '100',
                    type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
                    inputData: null,
                },
            ]);
        });
    });

    describe('getSourcePlugin', () => {
        const plugin = generateDaoPlugin({
            processKey: 'process-key',
            slug: 'plugin-slug',
            subdomain: 'plugin-subdomain',
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
        });
        const dao = generateDao({ plugins: [plugin] });

        it.each([
            { source: 'process-key', identifier: 'process key' },
            { source: 'plugin-slug', identifier: 'slug' },
            { source: 'plugin-subdomain', identifier: 'subdomain' },
            {
                source: PluginInterfaceType.TOKEN_VOTING,
                identifier: 'interface type',
            },
        ])('resolves the plugin by its $identifier', ({ source }) => {
            expect(
                transactionExecutionUtils.getSourcePlugin(source, dao),
            ).toEqual(plugin);
        });

        it('returns undefined when the source matches no plugin', () => {
            expect(
                transactionExecutionUtils.getSourcePlugin('unknown', dao),
            ).toBeUndefined();
        });

        it('returns undefined when the source is not set', () => {
            expect(
                transactionExecutionUtils.getSourcePlugin(undefined, dao),
            ).toBeUndefined();
        });

        it('returns undefined when the dao is not set', () => {
            expect(
                transactionExecutionUtils.getSourcePlugin(
                    'process-key',
                    undefined,
                ),
            ).toBeUndefined();
        });
    });

    describe('isExecution', () => {
        it('returns true for an execution', () => {
            const transaction = generateTransaction({
                side: TransactionSide.EXECUTION,
            });

            expect(transactionExecutionUtils.isExecution(transaction)).toBe(
                true,
            );
        });

        it.each<TransactionTransferSide>([
            TransactionSide.DEPOSIT,
            TransactionSide.WITHDRAW,
        ])('returns false for a %s transfer', (side) => {
            const transaction = generateTransaction({ side });

            expect(transactionExecutionUtils.isExecution(transaction)).toBe(
                false,
            );
        });
    });

    describe('getExecutionLabel', () => {
        const fromAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

        it('returns the name of the plugin that emitted the execution', () => {
            const plugin = generateDaoPlugin({
                interfaceType: PluginInterfaceType.MULTISIG,
                subdomain: 'multisig',
                name: 'Core council',
            });
            const transaction = generateTransaction({
                side: TransactionSide.EXECUTION,
                source: 'multisig',
            });

            expect(
                transactionExecutionUtils.getExecutionLabel(
                    transaction,
                    generateDao({ plugins: [plugin] }),
                ),
            ).toBe('Core council');
        });

        it('returns the raw source when it matches no plugin', () => {
            const transaction = generateTransaction({
                side: TransactionSide.EXECUTION,
                source: 'router',
            });

            expect(
                transactionExecutionUtils.getExecutionLabel(
                    transaction,
                    generateDao(),
                ),
            ).toBe('router');
        });

        it('returns the untruncated sender address when the execution has no source', () => {
            const transaction = generateTransaction({
                side: TransactionSide.EXECUTION,
                source: undefined,
                fromAddress,
            });

            expect(
                transactionExecutionUtils.getExecutionLabel(
                    transaction,
                    undefined,
                ),
            ).toBe(fromAddress);
        });
    });
});

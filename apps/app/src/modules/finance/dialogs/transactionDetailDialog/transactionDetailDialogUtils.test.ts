import { ProposalActionTypeNoBasicView } from '@aragon/gov-ui-kit';
import type { ITransactionActionsResult } from '@/modules/finance/api/financeService';
import {
    getTransactionActions,
    getTransactionActionsRefetchInterval,
} from './transactionDetailDialogUtils';

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

describe('transactionDetailDialogUtils', () => {
    describe('getTransactionActionsRefetchInterval', () => {
        it('polls while action decoding is pending', () => {
            const result = getTransactionActionsRefetchInterval({
                state: {
                    data: generateActionData({ decoding: true }),
                    dataUpdateCount: 1,
                },
            });

            expect(result).toBe(2000);
        });

        it('stops polling after ten successful responses', () => {
            const result = getTransactionActionsRefetchInterval({
                state: {
                    data: generateActionData({ decoding: true }),
                    dataUpdateCount: 10,
                },
            });

            expect(result).toBe(false);
        });

        it('does not poll when decoding has completed', () => {
            const result = getTransactionActionsRefetchInterval({
                state: {
                    data: generateActionData(),
                    dataUpdateCount: 1,
                },
            });

            expect(result).toBe(false);
        });
    });

    describe('getTransactionActions', () => {
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
                getTransactionActions(
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
                getTransactionActions(
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
                getTransactionActions(
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
});

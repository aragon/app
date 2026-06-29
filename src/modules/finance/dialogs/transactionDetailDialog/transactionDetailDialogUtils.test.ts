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
        it('returns decoded actions when all actions were decoded', () => {
            const action = {
                from: '0xfrom',
                to: '0xto',
                data: '0x',
                value: '0',
                type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
                inputData: null,
            };

            expect(
                getTransactionActions(
                    generateActionData({
                        actions: [action],
                        rawActions: [{ to: '0xto', data: '0x', value: '0' }],
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
                        rawActions: [
                            { to: '0xto', data: '0x1234', value: '5' },
                        ],
                    }),
                    '0xexecutor',
                ),
            ).toEqual([
                {
                    from: '0xexecutor',
                    to: '0xto',
                    data: '0x1234',
                    value: '5',
                    type: ProposalActionTypeNoBasicView.RAW_CALLDATA,
                    inputData: null,
                },
            ]);
        });
    });
});

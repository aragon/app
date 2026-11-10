import { TransactionSide } from '@/modules/finance/api/financeService';
import {
    generateWorkspacePendingTransaction,
    generateWorkspaceTransaction,
} from '../../testUtils';
import {
    workspaceSafeTransactionParam,
    workspaceTransactionUtils,
} from './workspaceTransactionUtils';

describe('workspaceTransaction utils', () => {
    const executed = generateWorkspaceTransaction({
        side: TransactionSide.EXECUTION,
        blockTimestamp: 1_700_000_000,
    });
    const pending = generateWorkspacePendingTransaction({
        submittedAt: 1_793_804_572,
    });
    const transfer = generateWorkspaceTransaction();

    describe('isExecution', () => {
        it('returns true for executed and pending executions only', () => {
            expect(workspaceTransactionUtils.isExecution(executed)).toBe(true);
            expect(workspaceTransactionUtils.isExecution(pending)).toBe(true);
            expect(workspaceTransactionUtils.isExecution(transfer)).toBe(false);
        });
    });

    describe('isPendingExecution', () => {
        it('returns true only for pending executions', () => {
            expect(workspaceTransactionUtils.isPendingExecution(pending)).toBe(
                true,
            );
            expect(workspaceTransactionUtils.isPendingExecution(executed)).toBe(
                false,
            );
            expect(workspaceTransactionUtils.isPendingExecution(transfer)).toBe(
                false,
            );
        });
    });

    describe('getTimestamp', () => {
        it('returns the block timestamp of an executed transaction', () => {
            expect(workspaceTransactionUtils.getTimestamp(executed)).toBe(
                1_700_000_000,
            );
        });

        it('returns the submission timestamp of a pending transaction', () => {
            expect(workspaceTransactionUtils.getTimestamp(pending)).toBe(
                1_793_804_572,
            );
        });
    });

    describe('isExecutable', () => {
        it('returns true once the required confirmations are collected', () => {
            expect(
                workspaceTransactionUtils.isExecutable(
                    generateWorkspacePendingTransaction({
                        confirmations: 2,
                        confirmationsRequired: 2,
                    }),
                ),
            ).toBe(true);
        });

        it('returns false while confirmations are missing', () => {
            expect(
                workspaceTransactionUtils.isExecutable(
                    generateWorkspacePendingTransaction({
                        confirmations: 1,
                        confirmationsRequired: 2,
                    }),
                ),
            ).toBe(false);
        });
    });

    describe('getSafeTransactionTitle', () => {
        it('prefixes the nonce with the initials of the account name', () => {
            expect(
                workspaceTransactionUtils.getSafeTransactionTitle(
                    '43',
                    'treasury  safe',
                ),
            ).toBe('TS-43');
        });

        it('ignores leading punctuation of a word', () => {
            expect(
                workspaceTransactionUtils.getSafeTransactionTitle(
                    '7',
                    '(Ops) Safe',
                ),
            ).toBe('OS-7');
        });

        it('falls back to the nonce alone when the account has no name', () => {
            expect(
                workspaceTransactionUtils.getSafeTransactionTitle('43'),
            ).toBe('#43');
            expect(
                workspaceTransactionUtils.getSafeTransactionTitle('43', '  '),
            ).toBe('#43');
        });
    });

    describe('getSafeTransactionUrl', () => {
        it('names the transaction on the transactions of its account', () => {
            expect(
                workspaceTransactionUtils.getSafeTransactionUrl(
                    'my-workspace',
                    'ethereum-sepolia-0xSafe',
                    '0xff54',
                ),
            ).toBe(
                `/workspace/my-workspace/ethereum-sepolia-0xSafe/transactions?${workspaceSafeTransactionParam}=0xff54`,
            );
        });
    });
});

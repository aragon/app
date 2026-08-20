import { ProposalStatus } from '@aragon/gov-ui-kit';
import {
    generateSafeConfirmation,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { SafeTransactionState } from '../../types';
import { safeMultisigProposalUtils } from './safeMultisigProposalUtils';

describe('safeMultisigProposal utils', () => {
    describe('supportsEip1271Signatures', () => {
        it.each([
            { version: '1.4.1', supported: true },
            { version: '1.4.1+L2', supported: true },
            { version: '1.5.0', supported: true },
            { version: '1.3.0', supported: false },
            { version: '1.1.1', supported: false },
            { version: null, supported: false },
        ])('returns $supported for Safe $version', ({ version, supported }) => {
            expect(
                safeMultisigProposalUtils.supportsEip1271Signatures(version),
            ).toEqual(supported);
        });
    });

    describe('getTransactionState', () => {
        it.each([
            {
                label: 'a fully confirmed transaction below the current nonce',
                nonce: '2234',
                isExecuted: false,
                confirmations: 6,
                currentNonce: '2289',
                state: SafeTransactionState.SUPERSEDED,
                isSuccessful: null,
            },
            {
                label: 'a transaction on the current nonce',
                nonce: '2289',
                isExecuted: false,
                confirmations: 1,
                currentNonce: '2289',
                state: SafeTransactionState.LIVE,
                isSuccessful: null,
            },
            {
                label: 'a transaction queued above the current nonce',
                nonce: '2290',
                isExecuted: false,
                confirmations: 0,
                currentNonce: '2289',
                state: SafeTransactionState.LIVE,
                isSuccessful: null,
            },
            {
                label: 'a transaction that reverted onchain but consumed its nonce',
                nonce: '47',
                isExecuted: true,
                confirmations: 5,
                currentNonce: '48',
                state: SafeTransactionState.EXECUTED,
                isSuccessful: false,
            },
        ])('classifies $label as $state', (testCase) => {
            const {
                nonce,
                isExecuted,
                isSuccessful,
                confirmations,
                currentNonce,
                state,
            } = testCase;
            const transaction = generateSafeMultisigTransaction({
                nonce,
                isExecuted,
                isSuccessful,
                confirmations: Array.from({ length: confirmations }, () =>
                    generateSafeConfirmation(),
                ),
            });

            expect(
                safeMultisigProposalUtils.getTransactionState({
                    transaction,
                    currentNonce,
                }),
            ).toEqual(state);
        });
    });

    describe('getTransactionStatus', () => {
        it.each([
            { nonce: '10', isExecuted: false, status: ProposalStatus.ACTIVE },
            { nonce: '9', isExecuted: false, status: ProposalStatus.EXPIRED },
            { nonce: '9', isExecuted: true, status: ProposalStatus.EXECUTED },
        ])('maps a transaction at nonce $nonce to $status', ({
            nonce,
            isExecuted,
            status,
        }) => {
            const transaction = generateSafeMultisigTransaction({
                nonce,
                isExecuted,
            });

            expect(
                safeMultisigProposalUtils.getTransactionStatus({
                    transaction,
                    currentNonce: '10',
                }),
            ).toEqual(status);
        });
    });

    describe('filterLiveTransactions', () => {
        it('keeps only the transactions whose nonce is still reachable', () => {
            const transactions = [
                generateSafeMultisigTransaction({
                    nonce: '2234',
                    safeTxHash: '0xdead',
                }),
                generateSafeMultisigTransaction({
                    nonce: '2289',
                    safeTxHash: '0xlive',
                }),
                generateSafeMultisigTransaction({
                    nonce: '2290',
                    safeTxHash: '0xqueued',
                }),
            ];

            const result = safeMultisigProposalUtils.filterLiveTransactions({
                transactions,
                currentNonce: '2289',
            });

            expect(result.map(({ safeTxHash }) => safeTxHash)).toEqual([
                '0xlive',
                '0xqueued',
            ]);
        });
    });

    describe('getExecutableTransactions', () => {
        it('returns a single executable transaction for a pair queued above the current nonce', () => {
            const transactions = [
                generateSafeMultisigTransaction({
                    nonce: '13',
                    safeTxHash: '0xnext',
                }),
                generateSafeMultisigTransaction({
                    nonce: '14',
                    safeTxHash: '0xlater',
                }),
            ];

            const result = safeMultisigProposalUtils.getExecutableTransactions({
                transactions,
                currentNonce: '13',
            });

            expect(result.map(({ safeTxHash }) => safeTxHash)).toEqual([
                '0xnext',
            ]);
        });

        it('surfaces both candidates of a same-nonce collision as competitors', () => {
            const transaction = generateSafeMultisigTransaction({
                nonce: '13',
                safeTxHash: '0xvariantA',
            });
            const competitor = generateSafeMultisigTransaction({
                nonce: '13',
                safeTxHash: '0xvariantB',
            });
            const transactions = [transaction, competitor];

            expect(
                safeMultisigProposalUtils.getExecutableTransactions({
                    transactions,
                    currentNonce: '13',
                }),
            ).toHaveLength(2);
            expect(
                safeMultisigProposalUtils.hasNonceCompetition({
                    transactions,
                    transaction,
                }),
            ).toBeTruthy();
        });

        it('marks the sibling of an executed transaction as dead once the nonce is consumed', () => {
            const executed = generateSafeMultisigTransaction({
                nonce: '47',
                safeTxHash: '0xreverted',
                isExecuted: true,
                isSuccessful: false,
            });
            const sibling = generateSafeMultisigTransaction({
                nonce: '47',
                safeTxHash: '0xstranded',
                confirmations: Array.from({ length: 5 }, () =>
                    generateSafeConfirmation(),
                ),
            });

            expect(
                safeMultisigProposalUtils.getExecutableTransactions({
                    transactions: [executed, sibling],
                    currentNonce: '48',
                }),
            ).toEqual([]);
            expect(
                safeMultisigProposalUtils.getTransactionState({
                    transaction: sibling,
                    currentNonce: '48',
                }),
            ).toEqual(SafeTransactionState.SUPERSEDED);
        });
    });

    describe('hasAddressConfirmed', () => {
        const owner = '0x00000000000000000000000000000000000000aB';

        it.each([
            {
                label: 'the same address in a different case',
                address: '0x00000000000000000000000000000000000000ab',
                confirmed: true,
            },
            {
                label: 'an owner that has not signed',
                address: '0x0000000000000000000000000000000000000012',
                confirmed: false,
            },
            {
                label: 'no connected wallet',
                address: undefined,
                confirmed: false,
            },
        ])('returns $confirmed for $label', ({ address, confirmed }) => {
            const transaction = generateSafeMultisigTransaction({
                confirmations: [generateSafeConfirmation({ owner })],
            });

            expect(
                safeMultisigProposalUtils.hasAddressConfirmed({
                    transaction,
                    address,
                }),
            ).toEqual(confirmed);
        });
    });

    describe('isThresholdReached', () => {
        it.each([
            { confirmations: 1, confirmationsRequired: 2, reached: false },
            { confirmations: 2, confirmationsRequired: 2, reached: true },
            { confirmations: 6, confirmationsRequired: 6, reached: true },
        ])('returns $reached for $confirmations of $confirmationsRequired confirmations', ({
            confirmations,
            confirmationsRequired,
            reached,
        }) => {
            const transaction = generateSafeMultisigTransaction({
                confirmationsRequired,
                confirmations: Array.from({ length: confirmations }, () =>
                    generateSafeConfirmation(),
                ),
            });

            expect(
                safeMultisigProposalUtils.isThresholdReached(transaction),
            ).toEqual(reached);
        });
    });
});

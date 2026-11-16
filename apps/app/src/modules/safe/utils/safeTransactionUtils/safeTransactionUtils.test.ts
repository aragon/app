import {
    generateSafeConfirmation,
    generateSafeMultisigTransaction,
} from '@/plugins/safeMultisigPlugin/testUtils';
import { SafeApprovalReadiness } from '../../types/safeApprovalReadiness';
import { SafeTransactionState } from '../../types/safeTransactionState';
import { safeTransactionUtils } from './safeTransactionUtils';

describe('safeTransaction utils', () => {
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
                safeTransactionUtils.supportsEip1271Signatures(version),
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
                safeTransactionUtils.getTransactionState({
                    transaction,
                    currentNonce,
                }),
            ).toEqual(state);
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

            const result = safeTransactionUtils.filterLiveTransactions({
                transactions,
                currentNonce: '2289',
            });

            expect(result.map(({ safeTxHash }) => safeTxHash)).toEqual([
                '0xlive',
                '0xqueued',
            ]);
        });
    });

    describe('getNonceCompetitors', () => {
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
                safeTransactionUtils
                    .getNonceCompetitors({ transactions, transaction })
                    .map(({ safeTxHash }) => safeTxHash),
            ).toEqual(['0xvariantB']);
            expect(
                safeTransactionUtils.hasNonceCompetition({
                    transactions,
                    transaction,
                }),
            ).toBeTruthy();
        });

        it('marks the sibling of an executed transaction as dead once the nonce is consumed', () => {
            // A reverted execution still consumes its nonce, so the sibling is unexecutable however
            // completely it was confirmed.
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

            // The rival was a genuine competitor for the slot, and winning it stranded the sibling:
            // a reverted execution consumes the nonce just as a successful one does.
            expect(
                safeTransactionUtils
                    .getNonceCompetitors({
                        transactions: [executed, sibling],
                        transaction: sibling,
                    })
                    .map(({ safeTxHash }) => safeTxHash),
            ).toEqual(['0xreverted']);
            expect(
                safeTransactionUtils.getTransactionState({
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
                safeTransactionUtils.hasAddressConfirmed({
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
        ])(
            'returns $reached for $confirmations of $confirmationsRequired confirmations',
            ({ confirmations, confirmationsRequired, reached }) => {
                const transaction = generateSafeMultisigTransaction({
                    confirmationsRequired,
                    confirmations: Array.from({ length: confirmations }, () =>
                        generateSafeConfirmation(),
                    ),
                });

                expect(
                    safeTransactionUtils.isThresholdReached(transaction),
                ).toEqual(reached);
            },
        );
    });
    describe('getCurrentOwnerConfirmations', () => {
        const ownerOne = '0x0000000000000000000000000000000000000011';
        const ownerTwo = '0x0000000000000000000000000000000000000012';
        const formerOwner = '0x0000000000000000000000000000000000000013';

        const getOwners = (
            confirmations: ReturnType<typeof generateSafeConfirmation>[],
        ) =>
            safeTransactionUtils
                .getCurrentOwnerConfirmations({
                    transaction: generateSafeMultisigTransaction({
                        confirmations,
                    }),
                    owners: [ownerOne, ownerTwo],
                })
                .map(({ owner }) => owner);

        it('returns the confirmations of current owners', () => {
            expect(
                getOwners([
                    generateSafeConfirmation({ owner: ownerOne }),
                    generateSafeConfirmation({ owner: ownerTwo }),
                ]),
            ).toEqual([ownerOne, ownerTwo]);
        });

        it('drops the confirmation of an address that is no longer an owner', () => {
            expect(
                getOwners([
                    generateSafeConfirmation({ owner: ownerOne }),
                    generateSafeConfirmation({ owner: formerOwner }),
                ]),
            ).toEqual([ownerOne]);
        });

        it('keeps one confirmation per owner whatever the address casing', () => {
            const checksummedOwner =
                '0x5F2c8A1b9D3e7C4a6B0d2E8f1A3c5B7d9E0f2A4c';

            expect(
                safeTransactionUtils
                    .getCurrentOwnerConfirmations({
                        transaction: generateSafeMultisigTransaction({
                            confirmations: [
                                generateSafeConfirmation({
                                    owner: checksummedOwner,
                                }),
                                generateSafeConfirmation({
                                    owner: checksummedOwner.toLowerCase(),
                                }),
                            ],
                        }),
                        owners: [checksummedOwner],
                    })
                    .map(({ owner }) => owner),
            ).toEqual([checksummedOwner]);
        });

        it.each([
            { label: 'an empty signature', signature: '0x' },
            {
                label: 'a truncated signature',
                signature: `0x${'a'.repeat(64)}`,
            },
            { label: 'a non-hex signature', signature: `0x${'z'.repeat(130)}` },
        ])('drops a confirmation carrying $label', ({ signature }) => {
            expect(
                getOwners([
                    generateSafeConfirmation({ owner: ownerOne, signature }),
                ]),
            ).toEqual([]);
        });

        it('keeps a contract signature longer than an ECDSA signature', () => {
            expect(
                getOwners([
                    generateSafeConfirmation({
                        owner: ownerOne,
                        signature: `0x${'a'.repeat(260)}`,
                        signatureType: 'CONTRACT_SIGNATURE',
                    }),
                ]),
            ).toEqual([ownerOne]);
        });
    });

    describe('getApprovalReadiness', () => {
        const ownerOne = '0x0000000000000000000000000000000000000011';
        const ownerTwo = '0x0000000000000000000000000000000000000012';

        it.each([
            {
                currentNonce: '10',
                isExecuted: false,
                isSuccessful: null,
                label: 'awaits the live threshold',
                nonce: '10',
                readiness: SafeApprovalReadiness.AWAITING_APPROVALS,
                threshold: 2,
                confirmations: [ownerOne],
            },
            {
                currentNonce: '10',
                isExecuted: false,
                isSuccessful: null,
                label: 'is ready at the current nonce',
                nonce: '10',
                readiness: SafeApprovalReadiness.READY_TO_EXECUTE,
                threshold: 2,
                confirmations: [ownerOne, ownerTwo],
            },
            {
                currentNonce: '10',
                isExecuted: false,
                isSuccessful: null,
                label: 'waits for an earlier nonce',
                nonce: '11',
                readiness: SafeApprovalReadiness.WAITING_FOR_NONCE,
                threshold: 2,
                confirmations: [ownerOne, ownerTwo],
            },
            {
                currentNonce: '11',
                isExecuted: false,
                isSuccessful: null,
                label: 'rejects a consumed nonce',
                nonce: '10',
                readiness: SafeApprovalReadiness.SUPERSEDED,
                threshold: 1,
                confirmations: [ownerOne],
            },
            {
                currentNonce: '10',
                isExecuted: true,
                isSuccessful: true,
                label: 'reports a successful execution',
                nonce: '10',
                readiness: SafeApprovalReadiness.EXECUTED_SUCCESS,
                threshold: 2,
                confirmations: [ownerOne],
            },
            {
                currentNonce: '10',
                isExecuted: true,
                isSuccessful: null,
                label: 'keeps an unknown execution outcome unresolved',
                nonce: '10',
                readiness: SafeApprovalReadiness.EXECUTED_UNKNOWN,
                threshold: 2,
                confirmations: [ownerOne],
            },
            {
                currentNonce: '10',
                isExecuted: true,
                isSuccessful: false,
                label: 'reports a reverted execution instead of ready',
                nonce: '10',
                readiness: SafeApprovalReadiness.EXECUTED_FAILURE,
                threshold: 1,
                confirmations: [ownerOne],
            },
            {
                currentNonce: '10',
                isExecuted: false,
                isSuccessful: null,
                label: 'counts a duplicated owner confirmation once',
                nonce: '10',
                readiness: SafeApprovalReadiness.AWAITING_APPROVALS,
                threshold: 2,
                confirmations: [ownerOne, ownerOne],
            },
        ])(
            'classifies a transaction that $label',
            ({
                currentNonce,
                isExecuted,
                isSuccessful,
                nonce,
                readiness,
                threshold,
                confirmations,
            }) => {
                const transaction = generateSafeMultisigTransaction({
                    confirmations: confirmations.map((owner) =>
                        generateSafeConfirmation({ owner }),
                    ),
                    confirmationsRequired: 1,
                    isExecuted,
                    isSuccessful,
                    nonce,
                });

                expect(
                    safeTransactionUtils.getApprovalReadiness({
                        currentNonce,
                        owners: [ownerOne, ownerTwo],
                        threshold,
                        transaction,
                    }),
                ).toEqual(readiness);
            },
        );
    });
});

import {
    generateSafeConfirmation,
    generateSafeMultisigTransaction,
} from '@/plugins/safeMultisigPlugin/testUtils/generators';
import {
    type IUncertainSafeWriteAttempt,
    isUncertainSafeWriteReconciled,
    matchesReviewedTransaction,
} from './safeNativeTransactionDialog';

const owner = '0x0000000000000000000000000000000000000011';
const safeTxHash = `0x${'1'.repeat(64)}`;
const signature = `0x${'2'.repeat(130)}`;

const attempt: IUncertainSafeWriteAttempt = {
    isNew: true,
    owner,
    safeTxHash,
    signature,
};

test('does not sign a transaction whose reviewed hash changed', () => {
    expect(
        matchesReviewedTransaction(safeTxHash, safeTxHash.toUpperCase()),
    ).toBe(true);
    expect(matchesReviewedTransaction(safeTxHash, `0x${'3'.repeat(64)}`)).toBe(
        false,
    );
});

test('keeps an uncertain write pending until its exact signature is indexed', () => {
    const transaction = generateSafeMultisigTransaction({ safeTxHash });

    expect(isUncertainSafeWriteReconciled({ attempt, transaction })).toBe(
        false,
    );
    expect(
        isUncertainSafeWriteReconciled({
            attempt,
            transaction: {
                ...transaction,
                confirmations: [generateSafeConfirmation({ owner, signature })],
            },
        }),
    ).toBe(true);
    expect(
        isUncertainSafeWriteReconciled({
            attempt,
            transaction: {
                ...transaction,
                confirmations: [
                    generateSafeConfirmation({
                        owner,
                        signature: `0x${'4'.repeat(130)}`,
                    }),
                ],
            },
        }),
    ).toBe(false);
});

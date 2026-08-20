import type { ISafeMultisigTransaction } from '@/shared/api/safeService';

export const generateSafeMultisigTransaction = (
    transaction?: Partial<ISafeMultisigTransaction>,
): ISafeMultisigTransaction => ({
    nonce: '0',
    safeTxHash: '0xsafeTxHash',
    from: '0x0000000000000000000000000000000000000011',
    to: '0x0000000000000000000000000000000000000021',
    value: '0',
    data: null,
    operation: 0,
    confirmations: [],
    confirmationsRequired: 2,
    signatures: null,
    isExecuted: false,
    isSuccessful: null,
    submissionDate: '2026-01-01T00:00:00Z',
    ...transaction,
});

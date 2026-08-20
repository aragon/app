import type { ISafeMultisigTransaction } from '@/shared/api/safeService';

export const generateSafeTransaction = (
    transaction?: Partial<ISafeMultisigTransaction>,
): ISafeMultisigTransaction => ({
    nonce: '0',
    safeTxHash: '0xSafeTxHash',
    from: '0xProposerAddress',
    to: '0xTargetAddress',
    value: '0',
    data: null,
    operation: 0,
    confirmations: [],
    confirmationsRequired: 1,
    signatures: null,
    isExecuted: false,
    submissionDate: '2026-01-01T00:00:00Z',
    ...transaction,
});

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
    safeTxGas: '0',
    baseGas: '0',
    gasPrice: '0',
    gasToken: '0x0000000000000000000000000000000000000000',
    refundReceiver: '0x0000000000000000000000000000000000000000',
    confirmations: [],
    confirmationsRequired: 1,
    signatures: null,
    isExecuted: false,
    isSuccessful: null,
    submissionDate: '2026-01-01T00:00:00Z',
    ...transaction,
});

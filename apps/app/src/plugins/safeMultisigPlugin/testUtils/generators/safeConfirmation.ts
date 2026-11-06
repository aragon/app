import type { ISafeConfirmation } from '@/shared/api/safeService';

export const generateSafeConfirmation = (
    confirmation?: Partial<ISafeConfirmation>,
): ISafeConfirmation => ({
    owner: '0x0000000000000000000000000000000000000011',
    // A well-formed 65-byte ECDSA signature, the shape the Safe transaction service returns for an owner.
    signature: `0x${'a'.repeat(130)}`,
    submissionDate: '2026-01-01T00:00:00Z',
    ...confirmation,
});

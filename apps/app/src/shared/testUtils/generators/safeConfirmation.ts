import type { ISafeConfirmation } from '@/shared/api/safeService';

export const generateSafeConfirmation = (
    confirmation?: Partial<ISafeConfirmation>,
): ISafeConfirmation => ({
    owner: '0xOwnerAddress',
    signature: '0xSignature',
    submissionDate: '2026-01-01T00:00:00Z',
    ...confirmation,
});

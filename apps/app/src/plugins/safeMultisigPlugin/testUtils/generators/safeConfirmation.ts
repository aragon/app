import type { ISafeConfirmation } from '@/shared/api/safeService';

export const generateSafeConfirmation = (
    confirmation?: Partial<ISafeConfirmation>,
): ISafeConfirmation => ({
    owner: '0x0000000000000000000000000000000000000011',
    signature: '0x',
    submissionDate: '2026-01-01T00:00:00Z',
    ...confirmation,
});

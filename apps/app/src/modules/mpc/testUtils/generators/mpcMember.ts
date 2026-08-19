import type { IMpcMember } from '@/modules/mpc/api/mpcService/domain';

export const generateMpcMember = (
    member?: Partial<IMpcMember>,
): IMpcMember => ({
    userId: 'user-1',
    username: 'alice',
    role: 'owner',
    addedAt: '2026-01-01T00:00:00.000Z',
    ...member,
});

import type {
    IMpcSession,
    IMpcUser,
} from '@/modules/mpc/api/mpcService/domain';

export const generateMpcUser = (user?: Partial<IMpcUser>): IMpcUser => ({
    id: 'user-1',
    username: 'alice',
    createdAt: '2026-01-01T00:00:00.000Z',
    totpEnabled: false,
    ...user,
});

export const generateMpcSession = (
    session?: Partial<IMpcSession>,
): IMpcSession => ({
    user: generateMpcUser(),
    expiresAt: '2026-01-02T00:00:00.000Z',
    ...session,
});

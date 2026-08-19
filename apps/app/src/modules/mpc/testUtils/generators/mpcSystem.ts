import type { IMpcSystem } from '@/modules/mpc/api/mpcService/domain';
import { generateMpcMember } from './mpcMember';
import { generateMpcPolicy } from './mpcPolicy';

export const generateMpcSystem = (
    system?: Partial<IMpcSystem>,
): IMpcSystem => ({
    id: 'system-1',
    name: 'Treasury key',
    description: 'POC system',
    status: 'active',
    providerId: 'mock-shamir',
    address: '0x1234567890123456789012345678901234567890',
    publicKey: '0x04ab',
    chainIds: [11_155_111],
    epoch: 1,
    recoveryAcknowledged: true,
    policy: generateMpcPolicy(),
    members: [generateMpcMember()],
    createdBy: 'user-1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...system,
});

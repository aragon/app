import type { IMpcPolicy } from '@/modules/mpc/api/mpcService/domain';

export const generateMpcPolicy = (
    policy?: Partial<IMpcPolicy>,
): IMpcPolicy => ({
    allowedChainIds: [11_155_111],
    recipientAllowlist: null,
    maxValuePerTxWei: null,
    dailyLimitWei: null,
    requireApprovalAboveWei: null,
    approvalsRequired: 1,
    allowContractCalls: true,
    allowMessageSigning: true,
    ...policy,
});

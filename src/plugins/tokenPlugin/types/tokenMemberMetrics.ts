import type { IMemberMetrics } from '@/modules/governance/api/governanceService';

export interface ITokenMemberMetrics extends IMemberMetrics {
    /**
     * Number of delegations received by the member.
     */
    delegateReceivedCount: number;
}

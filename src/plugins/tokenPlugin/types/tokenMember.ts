import type { IMember } from '@/modules/governance/api/governanceService';
import type { ITokenMemberMetrics } from './tokenMemberMetrics';

export interface ITokenMember extends Omit<IMember, 'metrics'> {
    /**
     * Type of the member.
     */
    type: 'token-voting';
    /**
     * Voting power of the member.
     */
    votingPower: string | null;
    /**
     * Token balance of the member.
     */
    tokenBalance: string | null;
    /**
     * Metrics for the token member.
     */
    metrics: ITokenMemberMetrics;
    /**
     * Current user delegate.
     */
    lastDelegate: string | null;
}

import type { IMember } from '@/modules/governance/api/governanceService';

export interface ITokenMember extends IMember {
    /**
     * Type of the member.
     */
    type: 'token-voting';
    /**
     * Voting power of the member.
     */
    votingPower: string;
    /**
     * Token balance of the member.
     */
    tokenBalance: string;
    /**
     * Metrics for the token member.
     */
    metrics: {
        /**
         * Number of delegations received by the member.
         */
        delegateReceivedCount: number;
    };
}

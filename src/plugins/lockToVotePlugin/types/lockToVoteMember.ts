import type { IMember } from '@/modules/governance/api/governanceService';

export interface ILockToVoteMember extends IMember {
    /**
     * Type of the member.
     */
    type: 'lock-to-vote';
    /**
     * Voting power of the member.
     */
    votingPower: string | null;
    /**
     * Token balance of the member.
     */
    tokenBalance: string | null;
}

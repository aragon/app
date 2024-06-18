import type { IMember } from '@/modules/governance/api/governanceService';

export interface ITokenMember extends IMember {
    /**
     * Type of the member.
     */
    type: 'tokenVoting';
    /**
     * Voting power of the member.
     */
    votingPower: string;
}

import type { ITokenVotingMember } from '@/modules/createDao/components/createProcessForm';

export interface ITokenSetupMembershipProps {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
}

export interface ITokenSetupMembershipForm {
    /**
     * Address of the token to be imported.
     */
    importTokenAddress?: string;
    /**
     * Name of the governance token.
     */
    tokenName?: string;
    /**
     * Symbol of the governance token.
     */
    tokenSymbol?: string;
    /**
     * The percentage of tokens that vote yes, out of all tokens that have voted, must be greater than this value for
     * the proposal to pass.
     */
    supportThreshold: number;
    /**
     * The percentage of tokens that participate in a proposal, out of the total supply, must be greater than or equal
     * to this value.
     */
    minimumParticipation: number;
    /**
     * Allows voters to change their vote during the voting period.
     */
    voteChange: boolean;
    /**
     * Members of the token voting body.
     */
    members: ITokenVotingMember[];
}

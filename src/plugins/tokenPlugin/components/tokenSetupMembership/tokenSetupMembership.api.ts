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
     * Members of the token voting body.
     */
    members: ITokenVotingMember[];
}

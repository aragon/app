import type { ITokenVotingMember } from '@/modules/createDao/components/createProcessForm';
import type { IResourcesInputResource } from '@/shared/components/forms/resourcesInput';
import type { DaoTokenVotingMode } from '../../types';

export interface ITokenCreateProcessFormBody {
    /**
     * Name of the body.
     */
    name: string;
    /**
     * ID of the body generated internally to reference bodies to permissions.
     */
    id: string;
    /**
     * Optional description of the voting body.
     */
    description?: string;
    /**
     * Resources of the body.
     */
    resources: IResourcesInputResource[];
    /**
     * Members of the voting body.
     */
    members: ITokenVotingMember[];

    // Token-specific values
    /**
     * Type of the token used on the body.
     */
    tokenType: 'imported' | 'new';
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
    minParticipation: number;
    /**
     * Allows voters to change their vote during the voting period.
     */
    votingMode: DaoTokenVotingMode;
}

export interface ITokenVotingBodySettings {
    /**
     * Min voting power / balance the user needs to have for creating proposals
     */
    minVotingPower?: string;
}

export interface ITokenVotingBodyCheckboxCardProps {
    /**
     * Body to render the checkbox card for.
     */
    body: ITokenCreateProcessFormBody;
    /**
     * Callback called on body checkbox change.
     */
    onChange: (bodyId: string, checked: boolean) => void;
    /**
     * Defines if the body is checked or not.
     */
    checked: boolean;
    /**
     * Prefix to be used for the body permission settings.
     */
    fieldPrefix: string;
}

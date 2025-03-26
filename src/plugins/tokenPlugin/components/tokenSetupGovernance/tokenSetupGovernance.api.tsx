import type { IToken } from '@/modules/finance/api/financeService';
import type { ITokenPluginSettings } from '../../types';

export interface ITokenSetupGovernanceProps {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
    /**
     * The token used by the plugin.
     */
    token: Pick<IToken, 'symbol' | 'totalSupply' | 'decimals'>;
    /**
     * Initial values for the form.
     */
    initialValues?: ITokenSetupGovernanceForm;
    /**
     * Hides the minimum-duration and early-execution fields when set to true.
     */
    isSubPlugin?: boolean;
    /**
     * Shows the settings for creating proposals when set to true.
     */
    showProposalCreationSettings?: boolean;
}

export interface ITokenSetupGovernanceForm
    extends Pick<
        ITokenPluginSettings,
        'supportThreshold' | 'minParticipation' | 'minProposerVotingPower' | 'minDuration' | 'votingMode'
    > {}

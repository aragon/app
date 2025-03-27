import type { IPluginSetupGovernanceParams } from '@/modules/createDao/types';
import type { IToken } from '@/modules/finance/api/financeService';
import type { ITokenPluginSettings } from '../../types';

export interface ITokenSetupGovernanceProps extends IPluginSetupGovernanceParams {
    /**
     * The token used by the plugin.
     */
    token: Pick<IToken, 'symbol' | 'totalSupply' | 'decimals'>;
}

export interface ITokenSetupGovernanceForm
    extends Pick<
        ITokenPluginSettings,
        'supportThreshold' | 'minParticipation' | 'minProposerVotingPower' | 'minDuration' | 'votingMode'
    > {}

import type { IPluginSetupGovernanceParams } from '@/modules/createDao/types';
import type { ITokenPluginSettings } from '../../types';
import type { ITokenSetupMembershipForm } from '../tokenSetupMembership';

export interface ITokenSetupGovernanceMembershipSettings
    extends Partial<Pick<ITokenSetupMembershipForm, 'members'>>,
        Pick<ITokenSetupMembershipForm, 'token'> {}

export interface ITokenSetupGovernanceProps extends Omit<IPluginSetupGovernanceParams, 'membershipSettings'> {
    /**
     * Membership settings of the multisig body.
     */
    membershipSettings: ITokenSetupGovernanceMembershipSettings;
}

export interface ITokenSetupGovernanceForm
    extends Pick<
        ITokenPluginSettings,
        'supportThreshold' | 'minParticipation' | 'minProposerVotingPower' | 'minDuration' | 'votingMode'
    > {}

import type { IPluginSetupGovernanceParams } from '@/modules/createDao/types';
import type { ILockToVotePluginSettings } from '../../types';
import type { ILockToVoteSetupMembershipForm } from '../lockToVoteSetupMembership';

export interface ILockToVoteSetupGovernanceMembershipSettings
    extends Partial<Pick<ILockToVoteSetupMembershipForm, 'members'>>,
        Pick<ILockToVoteSetupMembershipForm, 'token'> {}

export interface ILockToVoteSetupGovernanceProps extends Omit<IPluginSetupGovernanceParams, 'membershipSettings'> {
    /**
     * Membership settings of the multisig body.
     */
    membershipSettings: ILockToVoteSetupGovernanceMembershipSettings;
}

export interface ILockToVoteSetupGovernanceForm
    extends Pick<
        ILockToVotePluginSettings,
        'supportThreshold' | 'minParticipation' | 'minProposerVotingPower' | 'minDuration' | 'votingMode'
    > {}

import type { IPluginSetupGovernanceParams } from '@/modules/createDao/types';
import type { ITokenSetupMembershipForm } from '@/plugins/tokenPlugin/components/tokenSetupMembership';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { DaoLockToVoteVotingMode } from '../../types';

export interface ILockToVoteSetupGovernanceMembershipSettings
    extends Partial<Pick<ITokenSetupMembershipForm, 'members'>>,
        Pick<ITokenSetupMembershipForm, 'token'> {}

export interface ILockToVoteSetupGovernanceProps extends Omit<IPluginSetupGovernanceParams, 'membershipSettings'> {
    /**
     * Membership settings of the lock to vote body.
     */
    membershipSettings: ILockToVoteSetupGovernanceMembershipSettings;
}

export interface ILockToVoteSetupGovernanceForm
    extends Pick<ITokenPluginSettings, 'supportThreshold' | 'minParticipation' | 'minProposerVotingPower'> {
    /**
     * Amount of time a proposal can be live.
     */
    proposalDuration: number;
    /**
     * Voting mode of the DAO.
     */
    votingMode: DaoLockToVoteVotingMode;
}

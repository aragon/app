import type { IPluginSetupGovernanceParams } from '@/modules/createDao/types';
import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';
import type { IMultisigSetupMembershipForm } from '../multisigSetupMembership';

export interface IMultisigSetupGovernanceForm extends Pick<IMultisigPluginSettings, 'minApprovals' | 'onlyListed'> {}

export interface IMultisigSetupGovernanceMembershipSettings
    extends Partial<Pick<IMultisigSetupMembershipForm, 'members'>> {
    /**
     * Number of members used as fallback when the members list is not defined.
     */
    membersCount?: number;
}

export interface IMultisigSetupGovernanceProps extends Omit<IPluginSetupGovernanceParams, 'membershipSettings'> {
    /**
     * Membership settings of the multisig body.
     */
    membershipSettings: IMultisigSetupGovernanceMembershipSettings;
}

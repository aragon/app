import type { ISetupBodyFormMembership } from '../dialogs/setupBodyDialog';

export interface IPluginSetupGovernanceParams<TMembership extends ISetupBodyFormMembership = ISetupBodyFormMembership> {
    /**
     * Prefix to be appended to all form fields.
     */
    formPrefix: string;
    /**
     * Displays the relevant governance settings depending if the plugin is setup inside a SPP plugin or not.
     */
    isSubPlugin?: boolean;
    /**
     * Shows the settings for creating proposals when set to true.
     */
    showProposalCreationSettings?: boolean;
    /**
     * Membership settings of the plugin.
     */
    membershipSettings: TMembership;
}

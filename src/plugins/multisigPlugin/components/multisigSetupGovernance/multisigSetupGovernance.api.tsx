import type { IMultisigPluginSettings } from '@/plugins/multisigPlugin/types';

export interface IMultisigSetupGovernanceForm extends Pick<IMultisigPluginSettings, 'minApprovals' | 'onlyListed'> {}

export interface IMultisigSetupGovernanceProps {
    /**
     * Field prefix for the form fields. This is expected to always be a sub-form of the main form.
     */
    fieldPrefix: string;
    /**
     * Total number of members in the body of the DAO. It is a prop because it can either come from the API (actions) or
     * from the local members field (create process form).
     */
    membersCount: number;
    /**
     * Whether to show the proposal creation settings (who can vote, any vs members).
     */
    showProposalCreationSettings?: boolean;
}

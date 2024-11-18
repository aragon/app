import type { IPluginSettings } from '@/shared/api/daoService';
import type { IProposalAction } from '../api/governanceService';

export interface INormalizeActionsParams<TSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Proposal actions to be normalized.
     */
    actions: IProposalAction[];
    /**
     * Settings of the plugin at proposal creation.
     */
    settings: TSettings;
    /**
     * ID of the DAO related to the proposal.
     */
    daoId: string;
}

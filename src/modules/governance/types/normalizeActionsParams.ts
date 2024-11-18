import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import type { IProposalAction } from '../api/governanceService';

export interface INormalizeActionsParams<TSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Proposal actions to be normalized.
     */
    actions: IProposalAction[];
    /**
     * Plugin to use for normalizing the actions.
     */
    plugin: IDaoPlugin<TSettings>;
    /**
     * ID of the DAO related to the proposal.
     */
    daoId: string;
}

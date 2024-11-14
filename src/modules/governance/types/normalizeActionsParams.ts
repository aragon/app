import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';
import type { IProposal } from '../api/governanceService';

export interface INormalizeActionsParams<TSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Proposal to normalize the actions for.
     */
    proposal: IProposal;
    /**
     * Plugin to use for normalizing the actions.
     */
    plugin: IDaoPlugin<TSettings>;
    /**
     * ID of the DAO related to the proposal.
     */
    daoId: string;
}

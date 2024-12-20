import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';

export interface IPermissionCheckGuardParams<TPluginSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Plugin to check permissions for.
     */
    plugin: IDaoPlugin<TPluginSettings>;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Proposal to check permissions for.
     */
    proposal?: IProposal<TPluginSettings>;
}

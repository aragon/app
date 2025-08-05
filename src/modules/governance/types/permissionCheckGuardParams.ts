import type { IProposal } from '@/modules/governance/api/governanceService';
import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';

export interface IPermissionCheckGuardParams<TPluginSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Plugin to check permissions for.
     */
    plugin?: IDaoPlugin<TPluginSettings>;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Proposal to check permissions for.
     */
    proposal?: IProposal<TPluginSettings>;
    /**
     * Whether to show the connected user's permissions info.
     * @default true
     */
    useConnectedUserInfo?: boolean;
}

export type IEncapsulatedPermissionCheckGuardParams<TPluginSettings extends IPluginSettings = IPluginSettings> = Omit<
    IPermissionCheckGuardParams<TPluginSettings>,
    'plugin'
> & {
    /**
     * Required plugin for encapsulated permission checks.
     */
    plugin: IDaoPlugin<TPluginSettings>;
};

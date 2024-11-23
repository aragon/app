import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';

export interface IUsePluginMemberStatsParams<TSettings extends IPluginSettings = IPluginSettings> {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the DAO member.
     */
    address: string;
    /**
     * Plugin to display the stats for.
     */
    plugin: IDaoPlugin<TSettings>;
}

import type { IDaoPlugin } from '@/shared/api/daoService';

export interface IGetUninstallHelpersParams<TPlugin extends IDaoPlugin = IDaoPlugin> {
    /**
     * Plugin to be uninstalled.
     */
    plugin: TPlugin;
}

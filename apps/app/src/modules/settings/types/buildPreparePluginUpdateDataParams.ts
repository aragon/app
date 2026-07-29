import type { IDao, IDaoPlugin } from '@/shared/api/daoService';

export interface IBuildPreparePluginUpdateDataParams {
    /**
     * The plugin to be updated.
     */
    plugin: IDaoPlugin;
    /**
     * The DAO to update the plugin for.
     */
    dao: IDao;
}

import type { IDaoPlugin } from '@/shared/api/daoService';
import type { PluginType } from '@/shared/types';

export interface IDaoPlugInfoProps {
    /**
     * The selected plugin the info is related to.
     */
    plugin: IDaoPlugin;
    /**
     * The ID of the DAO.
     */
    daoId: string;
    /**
     * The type of plugin.
     */
    type: PluginType;
}

export enum DaoPluginInfoTabId {
    DESCRIPTION = 'DESCRIPTION',
    CONTRACT = 'CONTRACT',
    SETTINGS = 'SETTINGS',
}

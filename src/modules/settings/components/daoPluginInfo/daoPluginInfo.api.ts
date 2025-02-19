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

export interface IDaoPluginInfoTab {
    /**
     * The ID of the tab.
     */
    id: DaoPluginInfoTabId;
    /**
     * The label of the tab.
     */
    label: string;
    /**
     * Flag indicating whether or not the tab should be hidden (when it has no content).
     */
    hidden?: boolean;
}

export enum DaoPluginInfoTabId {
    DESCRIPTION = 'DESCRIPTION',
    CONTRACT = 'CONTRACT',
    SETTINGS = 'SETTINGS',
}

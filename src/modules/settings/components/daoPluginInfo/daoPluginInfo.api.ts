import type { IDaoPlugin } from '@/shared/api/daoService';

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
     * Flag indicating whether plugin info component is rendered on the DAO members page or not.
     */
    isMembersPage?: boolean;
}

export interface IDaoPluginInfoTab {
    /**
     * The ID of the tab.
     */
    id: DaoPluginInfoTabId;
    /**
     * The title of the tab.
     */
    title: string;
    /**
     * Flag indicating whether or not the tab should be hidden (when it has no content).
     */
    hidden: boolean;
}

export enum DaoPluginInfoTabId {
    DESCRIPTION = 'DESCRIPTION',
    CONTRACT = 'CONTRACT',
    SETTINGS = 'SETTINGS',
}

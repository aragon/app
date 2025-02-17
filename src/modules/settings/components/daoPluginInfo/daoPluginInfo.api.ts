import type { IDaoPlugin } from '@/shared/api/daoService';

export interface IDaoPlugInfoProps {
    /**
     * The DAO plugin to display information for.
     */
    plugin: IDaoPlugin;
    /**
     * The DAO ID.
     */
    daoId: string;
    /**
     * Flag indicating whether plugin info component is rendered on the member page or not.
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
     * Flag indicating whether or not to render the tab.
     */
    hidden: boolean;
}

export enum DaoPluginInfoTabId {
    DESCRIPTION = 'DESCRIPTION',
    CONTRACT = 'CONTRACT',
    SETTINGS = 'SETTINGS',
}

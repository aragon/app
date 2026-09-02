'use client';

import { useMemo } from 'react';
import type { IWorkspaceAccount } from '@/modules/workspace/api/workspaceService';
import {
    type IWorkspaceBodyPlugin,
    workspaceBodyUtils,
} from '@/modules/workspace/utils/workspaceBodyUtils';
import { useDaoOverrides } from '@/shared/api/cmsService';
import { useWorkspaceAccountDaos } from '../useWorkspaceAccountDaos';

export interface IUseWorkspaceBodyPluginsParams {
    /**
     * Accounts of the workspace to collect the bodies of.
     */
    accounts?: IWorkspaceAccount[];
}

export interface IUseWorkspaceBodyPluginsReturn {
    /**
     * Every body of every workspace account, including the bodies of those accounts' linked accounts.
     */
    bodyPlugins: IWorkspaceBodyPlugin[];
    /**
     * Defines if the account DAOs are still loading, i.e. the body list is not final yet.
     */
    isLoading: boolean;
}

/**
 * Collects the body plugins of every account of a workspace, CMS visibility overrides applied.
 *
 * The members page is a body-level surface, so this is its filter source: one option per body, each carrying the DAO
 * that owns it so member queries can be scoped correctly.
 */
export const useWorkspaceBodyPlugins = (
    params: IUseWorkspaceBodyPluginsParams,
): IUseWorkspaceBodyPluginsReturn => {
    const { accounts } = params;

    const { accountDaos, isLoading } = useWorkspaceAccountDaos({ accounts });
    const { data: daoOverrides } = useDaoOverrides();

    const bodyPlugins = useMemo(
        () => workspaceBodyUtils.getBodyPlugins({ accountDaos, daoOverrides }),
        [accountDaos, daoOverrides],
    );

    return { bodyPlugins, isLoading };
};

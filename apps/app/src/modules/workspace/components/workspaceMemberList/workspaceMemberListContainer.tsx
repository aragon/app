'use client';

import type { ReactNode } from 'react';
import type { IGetMemberListParams } from '@/modules/governance/api/governanceService';
import { DaoMemberList } from '@/modules/governance/components/daoMemberList';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import type { IWorkspaceBodyPlugin } from '@/modules/workspace/utils/workspaceBodyUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import {
    type IFilterComponentPlugin,
    PluginFilterComponent,
} from '@/shared/components/pluginFilterComponent';

export interface IWorkspaceMemberListContainerProps {
    /**
     * Body options of the workspace, one per body of every account.
     */
    bodyPlugins: IWorkspaceBodyPlugin[];
    /**
     * Currently selected option.
     */
    value?: IFilterComponentPlugin<IDaoPlugin>;
    /**
     * Callback called when another option is selected.
     */
    onValueChange?: (option: IFilterComponentPlugin<IDaoPlugin>) => void;
    /**
     * Synthetic tabs prepended before the body tabs, e.g. one Featured delegates tab per account that has a config.
     */
    syntheticTabs?: IFilterComponentPlugin<IDaoPlugin>[];
    /**
     * Number of members to fetch per page.
     */
    pageSize: number;
    /**
     * URL parameter name holding the selected body.
     */
    searchParamName: string;
    /**
     * Children of the component.
     */
    children?: ReactNode;
}

/**
 * Member list of a workspace, filtered by body.
 *
 * Every option maps to exactly one `(daoId, pluginAddress)` pair, which is precisely the query
 * `DaoMemberList.Default` already issues — so the list itself is reused unchanged and no cross-account aggregation is
 * involved. `daoId` is the DAO that **owns** the body, so a body installed on a linked account queries and links to
 * that child DAO rather than to the workspace account.
 */
export const WorkspaceMemberListContainer: React.FC<
    IWorkspaceMemberListContainerProps
> = (props) => {
    const {
        bodyPlugins,
        value,
        onValueChange,
        syntheticTabs = [],
        pageSize,
        searchParamName,
        ...otherProps
    } = props;

    const processedPlugins = bodyPlugins.map((bodyPlugin) => {
        const initialParams: IGetMemberListParams = {
            queryParams: {
                daoId: bodyPlugin.daoId,
                pluginAddress: bodyPlugin.meta.address,
                pageSize,
            },
        };

        return {
            ...bodyPlugin,
            // Long labels are unavoidable once every body is qualified with its owning DAO name, so the toggle is
            // allowed to truncate rather than stretch the filter row.
            className: 'max-w-64 [&>div]:min-w-0 [&>div]:truncate',
            props: { initialParams, plugin: bodyPlugin.meta },
        };
    });

    const allPlugins = [...syntheticTabs, ...processedPlugins];

    return (
        <PluginFilterComponent
            Fallback={DaoMemberList.Default}
            onValueChange={onValueChange}
            plugins={allPlugins}
            searchParamName={searchParamName}
            slotId={GovernanceSlotId.GOVERNANCE_DAO_MEMBER_LIST}
            value={value}
            {...otherProps}
        />
    );
};

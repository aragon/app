'use client';

import type { IWorkspaceAssetListMetadata } from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import type { IWorkspaceAccountOption } from '../../hooks/useWorkspaceAccountOptions';
import { WorkspaceAllAssetsAsideCard } from './workspaceAllAssetsAsideCard';
import { WorkspaceDaoAssetsAsideCard } from './workspaceDaoAssetsAsideCard';
import { WorkspaceSafeAssetsAsideCard } from './workspaceSafeAssetsAsideCard';

export interface IWorkspaceAssetsAsideCardProps {
    /**
     * Account option selected on the page. The whole workspace is described when unset or set to the aggregated
     * option.
     */
    activeOption?: IWorkspaceAccountOption;
    /**
     * Totals of the selected option, as reported by the workspace asset list endpoint.
     */
    metadata?: IWorkspaceAssetListMetadata;
}

/**
 * Aside card of the workspace assets page, picking the card matching the selected account.
 *
 * Each account type describes itself differently, so the card of a type is its own component: a DAO account shows
 * the same card as the DAO assets page, a Safe account shows the Safe card, the aggregated option shows the workspace
 * totals. A new account type is added as a case here.
 */
export const WorkspaceAssetsAsideCard: React.FC<
    IWorkspaceAssetsAsideCardProps
> = (props) => {
    const { activeOption, metadata } = props;

    switch (activeOption?.account?.type) {
        case WorkspaceAccountType.DAO:
            return (
                <WorkspaceDaoAssetsAsideCard
                    account={activeOption.account}
                    label={activeOption.label}
                    metadata={metadata}
                />
            );
        case WorkspaceAccountType.SAFE:
            return (
                <WorkspaceSafeAssetsAsideCard
                    account={activeOption.account}
                    label={activeOption.label}
                    metadata={metadata}
                />
            );
        default:
            return <WorkspaceAllAssetsAsideCard metadata={metadata} />;
    }
};

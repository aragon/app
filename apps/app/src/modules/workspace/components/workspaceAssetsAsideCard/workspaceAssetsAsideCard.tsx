'use client';

import type { IWorkspaceAssetListMetadata } from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import type { IWorkspaceAccountFilterOption } from '../../hooks/useWorkspaceAccountFilter';
import { WorkspaceAllAssetsAsideCard } from './workspaceAllAssetsAsideCard';
import { WorkspaceDaoAssetsAsideCard } from './workspaceDaoAssetsAsideCard';

export interface IWorkspaceAssetsAsideCardProps {
    /**
     * Account option selected on the page. The whole workspace is described when unset or set to the aggregated
     * option.
     */
    activeOption?: IWorkspaceAccountFilterOption;
    /**
     * Totals of the selected option, as reported by the workspace asset list endpoint.
     */
    metadata?: IWorkspaceAssetListMetadata;
}

/**
 * Aside card of the workspace assets page, picking the card matching the selected account.
 *
 * Each account type describes itself differently, so the card of a type is its own component: a DAO account shows
 * the same card as the DAO assets page, the aggregated option shows the workspace totals. A new account type is
 * added by branching on it here.
 */
export const WorkspaceAssetsAsideCard: React.FC<
    IWorkspaceAssetsAsideCardProps
> = (props) => {
    const { activeOption, metadata } = props;

    const account = activeOption?.account;

    if (activeOption != null && account?.type === WorkspaceAccountType.DAO) {
        return (
            <WorkspaceDaoAssetsAsideCard
                account={account}
                label={activeOption.label}
                metadata={metadata}
            />
        );
    }

    // Safe accounts have no card of their own yet, so they fall back to the plain totals of the selection.
    return (
        <WorkspaceAllAssetsAsideCard
            metadata={metadata}
            title={activeOption?.label}
        />
    );
};

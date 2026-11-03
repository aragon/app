'use client';

import type { IWorkspaceAssetListMetadata } from '../../api/workspaceQueryService';
import type { IWorkspaceAccount } from '../../api/workspaceService';
import { WorkspaceSafeAsideCard } from '../workspaceSafeAsideCard';
import { useWorkspaceAssetStats } from './useWorkspaceAssetStats';

export interface IWorkspaceSafeAssetsAsideCardProps {
    /**
     * Safe account selected on the page.
     */
    account: IWorkspaceAccount;
    /**
     * Label of the account, used as the title of the card.
     */
    label: string;
    /**
     * Totals of the selection, as reported by the workspace asset list endpoint.
     */
    metadata?: IWorkspaceAssetListMetadata;
}

/**
 * Assets aside card of a Safe account of a workspace: the Safe card fed with the asset stats of that single account.
 */
export const WorkspaceSafeAssetsAsideCard: React.FC<
    IWorkspaceSafeAssetsAsideCardProps
> = (props) => {
    const { account, label, metadata } = props;

    const stats = useWorkspaceAssetStats(metadata);

    return (
        <WorkspaceSafeAsideCard account={account} stats={stats} title={label} />
    );
};

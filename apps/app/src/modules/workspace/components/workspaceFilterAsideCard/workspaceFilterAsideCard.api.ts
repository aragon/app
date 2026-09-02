import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IWorkspaceFilterOption } from '../../hooks/useWorkspaceFilterUrlParam';

export interface IWorkspaceAllAccountsStats {
    /**
     * Sum of the USD value of every asset across every account.
     */
    totalAmountUsd?: number;
    /**
     * Total number of assets across every account.
     */
    totalRecords?: number;
}

export interface IWorkspaceFilterAsideCardProps {
    /**
     * Active account filter option.
     */
    activeOption: IWorkspaceFilterOption;
    /**
     * Aggregated asset stats of the whole workspace, used by the "All accounts" view.
     */
    allAccountsStats?: IWorkspaceAllAccountsStats;
    /**
     * First page of the selected account's list, used to build its stats (asset count, transaction count and last
     * activity). Only read when a single account or linked account is selected.
     */
    selectedMetadata?: IPaginatedResponse<unknown>;
    /**
     * Type of stats to display, which determines the labels and formatting.
     */
    statsType: 'transactions' | 'assets';
}

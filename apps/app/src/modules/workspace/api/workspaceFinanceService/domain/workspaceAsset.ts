import type { IAsset } from '@/modules/finance/api/financeService';

export interface IWorkspaceAsset extends IAsset {
    /**
     * ID of the DAO the asset belongs to, used to attribute the asset to a workspace account.
     */
    daoId: string;
}

export interface IWorkspaceAssetListResult {
    /**
     * Assets of every requested account, merged and ordered by USD value descending.
     */
    assets: IWorkspaceAsset[];
    /**
     * Total number of assets across every requested account.
     */
    totalRecords: number;
    /**
     * Sum of the USD value of every asset across every requested account.
     */
    totalAmountUsd: number;
    /**
     * Set to true when at least one account had more asset pages than the fetch cap allows, meaning `assets` and
     * `totalAmountUsd` are incomplete. `totalRecords` stays exact as it comes from the response metadata.
     */
    isTruncated: boolean;
}

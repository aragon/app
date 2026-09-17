import type { IAsset } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import type { IWorkspaceAccountRef } from './workspaceAccountInfo';

export interface IWorkspaceAssetAllocation {
    /**
     * Account holding this part of the balance.
     */
    account: IWorkspaceAccountRef;
    /**
     * Amount held by the account, already parsed with the token decimals.
     */
    amount: string;
    /**
     * Value in USD of the amount held by the account.
     */
    amountUsd: string;
}

/**
 * A token balance of a workspace, aggregated over every selected account holding it on one network.
 *
 * Extends the DAO {@link IAsset} on purpose: the backend projects the same nested `token` (network and address
 * included), so the shared `AssetListItem` renders a workspace asset unchanged.
 */
export interface IWorkspaceAsset extends IAsset {
    /**
     * Network the balance lives on. Native tokens are never merged across networks.
     */
    network: Network;
    /**
     * Address of the token.
     */
    tokenAddress: string;
    /**
     * Split of the balance per selected account.
     */
    allocations: IWorkspaceAssetAllocation[];
}

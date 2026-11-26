import type { Network } from '@/shared/api/daoService';
import type { IGetAssetListParams } from '../api/financeService';

export interface ISafeAssetListSource {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe.
     */
    address: string;
}

export interface ISafeAssetListParams {
    /**
     * Safe to list the balances of. The backend indexes the assets of DAOs only, so the balances of a Safe are read
     * from the Safe transaction service.
     */
    safe: ISafeAssetListSource;
}

/**
 * Where an asset list is read from: the indexed assets of a DAO, or the balances of a Safe.
 */
export type AssetListParams = IGetAssetListParams | ISafeAssetListParams;

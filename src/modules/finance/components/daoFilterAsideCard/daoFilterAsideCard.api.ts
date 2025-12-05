import type { IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IDao } from '@/shared/api/daoService';

export interface IDaoFilterAsideCardProps {
    /**
     * The DAO (from useDao hook).
     */
    dao: IDao;
    /**
     * Filter URL param name to sync with useDaoFilterUrlParam.
     */
    filterParamName: string;
    /**
     * Metadata for the selected DAO/SubDAO view.
     * Used to build stats like transaction count, asset count, last activity, etc.
     */
    selectedMetadata?: IPaginatedResponse<unknown>;
    /**
     * Metadata for "All" view (parent + all SubDAOs).
     * Used to get totalAssets for AllAssetsStats component.
     */
    allMetadata?: IPaginatedResponse<unknown>;
    /**
     * Type of stats to display - determines formatting and labels.
     */
    statsType: 'transactions' | 'assets';
}

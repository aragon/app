import type { IDao } from '@/shared/api/daoService';

export interface IAssetListStatsProps {
    /**
     * The DAO for which to fetch the asset list stats.
     */
    dao: IDao;
}

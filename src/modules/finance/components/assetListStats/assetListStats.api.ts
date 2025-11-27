import type { IDao } from '@/shared/api/daoService';

export interface IAssetListStatsProps {
    /**
     * DAO to display aggregate asset stats for.
     */
    dao: IDao;
}

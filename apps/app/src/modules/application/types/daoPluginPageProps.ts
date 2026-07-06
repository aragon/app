import type { IDao } from '@/shared/api/daoService';
import type { IDaoPageParams } from '@/shared/types';

export interface IDaoPluginPageProps {
    /**
     * DAO page parameters.
     */
    params: Promise<IDaoPageParams>;
    /**
     * DAO retrieved using the URL parameters.
     */
    dao: IDao;
}

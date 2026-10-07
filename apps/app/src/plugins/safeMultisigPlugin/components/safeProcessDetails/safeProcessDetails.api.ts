import type { IDao, IDaoPlugin } from '@/shared/api/daoService';

export interface ISafeProcessDetailsProps {
    /**
     * Root DAO context containing the process and any linked accounts.
     */
    dao: IDao;
    /**
     * Safe process selected for this details page.
     */
    plugin: IDaoPlugin;
}

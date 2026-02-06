import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDao, ISubDaoSummary } from '@/shared/api/daoService';

export interface IFindTargetDaoParams {
    /**
     * Root DAO that may contain subDAOs.
     */
    dao: IDao;
    /**
     * Address of the target DAO (parent or subDAO).
     */
    targetAddress: string;
}

class DaoTargetUtils {
    /**
     * Find a DAO (parent) or subDAO by address.
     * Returns undefined when the target address doesn't match any known DAO.
     */
    findTargetDao(
        params: IFindTargetDaoParams,
    ): IDao | ISubDaoSummary | undefined {
        const { dao, targetAddress } = params;

        if (addressUtils.isAddressEqual(dao.address, targetAddress)) {
            return dao;
        }

        return dao.subDaos?.find((subDao) =>
            addressUtils.isAddressEqual(subDao.address, targetAddress),
        );
    }
}

export const daoTargetUtils = new DaoTargetUtils();

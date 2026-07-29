import { addressUtils } from '@aragon/gov-ui-kit';
import type { IDao, ILinkedAccountSummary } from '@/shared/api/daoService';

export interface IFindTargetDaoParams {
    /**
     * Root DAO that may contain linked accounts.
     */
    dao: IDao;
    /**
     * Address of the target DAO (parent or linked account).
     */
    targetAddress: string;
}

class DaoTargetUtils {
    /**
     * Find a DAO (parent) or linked account by address.
     * Returns undefined when the target address doesn't match any known DAO.
     */
    findTargetDao(
        params: IFindTargetDaoParams,
    ): IDao | ILinkedAccountSummary | undefined {
        const { dao, targetAddress } = params;

        if (addressUtils.isAddressEqual(dao.address, targetAddress)) {
            return dao;
        }

        return dao.linkedAccounts?.find((linkedAccount) =>
            addressUtils.isAddressEqual(linkedAccount.address, targetAddress),
        );
    }
}

export const daoTargetUtils = new DaoTargetUtils();

import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { TransactionReceipt } from 'viem';

export interface IBuildPrepareUpdatePluginsTransactionParams {
    /**
     * DAO to prepare the plugin updates for.
     */
    dao: IDao;
    /**
     * Plugins to prepare the updates for.
     */
    plugins: IDaoPlugin[];
}

export interface IGetApplyUpdateProposalParams extends IBuildPrepareUpdatePluginsTransactionParams {
    /**
     * Defines if the DAO has a protocol update available or not.
     */
    osxUpdate: boolean;
    /**
     * Receipt of the prepare update transaction.
     */
    prepareUpdateReceipt?: TransactionReceipt;
}

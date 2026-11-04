import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    type ITransaction,
    type ITransactionExecution,
    TransactionSide,
} from '../api/financeService';

class TransactionExecutionUtils {
    /**
     * Narrows a transaction to an execution.
     */
    isExecution = (
        transaction: ITransaction,
    ): transaction is ITransactionExecution =>
        transaction.side === TransactionSide.EXECUTION;

    /**
     * Label displayed next to an execution: the name of the plugin that emitted it, or else its raw source or sender
     * address. The address is returned untruncated, so that it can be rendered through `AddressOutput`.
     */
    getExecutionLabel = (
        transaction: ITransactionExecution,
        dao: IDao | undefined,
    ): string => {
        const sourcePlugin = this.getSourcePlugin(transaction.source, dao);

        if (sourcePlugin != null) {
            return daoUtils.getPluginName(sourcePlugin);
        }

        return transaction.source ?? transaction.fromAddress;
    };

    /**
     * Resolves the DAO plugin that initiated an execution from its backend `source`
     * identifier (process key, slug, subdomain or interface type).
     */
    getSourcePlugin = (
        source: string | undefined,
        dao: IDao | undefined,
    ): IDaoPlugin | undefined =>
        daoUtils
            .getDaoPlugins(dao)
            ?.find(
                (plugin) =>
                    plugin.processKey === source ||
                    plugin.slug === source ||
                    plugin.subdomain === source ||
                    plugin.interfaceType === source,
            );
}

export const transactionExecutionUtils = new TransactionExecutionUtils();

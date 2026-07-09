import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';

class TransactionExecutionUtils {
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

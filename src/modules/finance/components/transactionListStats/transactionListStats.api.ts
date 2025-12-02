import type { IDao } from '@/shared/api/daoService';
import type { IDefinitionListContainerProps } from '@aragon/gov-ui-kit';

export interface ITransactionListStatsProps extends IDefinitionListContainerProps {
    /**
     * Parent DAO data, used as a fallback.
     */
    dao: IDao;
    /**
     * Total number of transactions.
     */
    totalTransactions?: number;
    /**
     * Timestamp of the last transaction.
     */
    lastActivityTimestamp?: number;
}

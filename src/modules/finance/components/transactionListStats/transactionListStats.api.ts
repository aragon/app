import type { IDao } from '@/shared/api/daoService';
import type { IDefinitionListContainerProps } from '@aragon/gov-ui-kit';

export interface ITransactionListStatsProps extends IDefinitionListContainerProps {
    dao: IDao;
}

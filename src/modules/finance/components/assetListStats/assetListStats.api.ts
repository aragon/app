import type { IDao } from '@/shared/api/daoService';
import type { IDefinitionListContainerProps } from '@aragon/gov-ui-kit';

export interface IAssetListStatsProps extends IDefinitionListContainerProps {
    /**
     * DAO to display aggregate asset stats for.
     */
    dao: IDao;
    /**
     * Optional token count (from asset list metadata).
     */
    tokenCount?: number;
    /**
     * Optional total value in USD (override DAO metrics).
     */
    totalValueUsd?: string | number;
}

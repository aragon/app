import type { IDefinitionListContainerProps } from '@aragon/gov-ui-kit';
import type { IDao, ISubDaoSummary, Network } from '@/shared/api/daoService';

export interface IDaoInfoAsideProps
    extends Omit<IDefinitionListContainerProps, 'onCopy'> {
    /**
     * Network used to build explorer links when DAO data is missing.
     */
    network: Network;
    /**
     * DAO id for chain explorer routes.
     */
    daoId: string;
    /**
     * Selected SubDAO data, if any.
     */
    subDao?: ISubDaoSummary;
    /**
     * Parent DAO data, used as a fallback.
     */
    dao?: IDao;
    /*
     * Precomputed stats to display; empty array hides the stats grid.
     */
    stats: Array<{ label: string; value: string | number }>;
}

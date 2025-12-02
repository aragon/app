import type { IDao, IDaoPlugin, ISubDaoSummary, Network } from '@/shared/api/daoService';
import type { IDefinitionListContainerProps } from '@aragon/gov-ui-kit';

/**
 * Props for rendering DAO and SubDAO info in the aside panel.
 */
export interface IDaoInfoAsideProps extends Omit<IDefinitionListContainerProps, 'onCopy'> {
    /**
     * Active plugin metadata for resolving defaults like address/description.
     */
    plugin: IDaoPlugin;
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

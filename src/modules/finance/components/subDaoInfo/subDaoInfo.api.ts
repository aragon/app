import type { IDaoPlugin, Network } from '@/shared/api/daoService';
import type { IDefinitionListContainerProps } from '@aragon/gov-ui-kit';

export interface ISubDaoInfoProps extends IDefinitionListContainerProps {
    /**
     * Plugin (SubDAO) to display info for.
     */
    plugin: IDaoPlugin;
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * ID of the parent DAO.
     */
    daoId: string;
}

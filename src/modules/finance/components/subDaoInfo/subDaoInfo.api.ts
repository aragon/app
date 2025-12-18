import type { IDefinitionListContainerProps } from '@aragon/gov-ui-kit';
import type { ISubDaoSummary, Network } from '@/shared/api/daoService';

export interface ISubDaoInfoProps extends IDefinitionListContainerProps {
    /**
     * SubDAO to display info for.
     */
    plugin: ISubDaoSummary;
    /**
     * Network of the parent DAO.
     */
    network: Network;
    /**
     * ID of the parent DAO.
     */
    daoId: string;
}

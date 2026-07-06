import type { IDefinitionListContainerProps } from '@aragon/gov-ui-kit';
import type { ILinkedAccountSummary, Network } from '@/shared/api/daoService';

export interface ILinkedAccountInfoProps extends IDefinitionListContainerProps {
    /**
     * Linked account to display info for.
     */
    plugin: ILinkedAccountSummary;
    /**
     * Network of the parent DAO.
     */
    network: Network;
    /**
     * ID of the parent DAO.
     */
    daoId: string;
}

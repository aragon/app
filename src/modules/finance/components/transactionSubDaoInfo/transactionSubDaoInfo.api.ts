import type { IDaoPlugin, Network } from '@/shared/api/daoService';
import type { IDefinitionListContainerProps } from '@aragon/gov-ui-kit';

export interface ITransactionSubDaoInfoProps extends Omit<IDefinitionListContainerProps, 'onCopy'> {
    plugin: IDaoPlugin;
    network: Network;
    daoId: string;
}

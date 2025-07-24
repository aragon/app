import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { DataList, SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';
import { useAllowedActionsListData } from '../../hooks/useAllowedActionsListData';

export interface IDaoProcessAllowedActionsProps {
    /**
     * Network of the DAO process.
     */
    network: Network;
    /**
     * Address of the process.
     */
    pluginAddress: string;
}

export const DaoProcessAllowedActions: React.FC<IDaoProcessAllowedActionsProps> = (props) => {
    const { network, pluginAddress } = props;

    const { allowedActionsList, itemsCount, onLoadMore, state, emptyState } = useAllowedActionsListData({
        urlParams: { network, pluginAddress },
        queryParams: {},
    });

    const chainId = networkDefinitions[network].id;

    return (
        <DataList.Root entityLabel="" pageSize={12} onLoadMore={onLoadMore} itemsCount={itemsCount} state={state}>
            <DataList.Container emptyState={emptyState} SkeletonElement={SmartContractFunctionDataListItem.Skeleton}>
                {allowedActionsList?.map((action, index) => (
                    <SmartContractFunctionDataListItem.Structure
                        key={index}
                        functionName={action.decoded.functionName}
                        contractAddress={action.target}
                        contractName={action.decoded.contractName}
                        chainId={chainId}
                    />
                ))}
            </DataList.Container>
        </DataList.Root>
    );
};

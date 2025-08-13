import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import { type IDaoPlugin, type Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import {
    DataList,
    SmartContractFunctionDataListItem,
    type IEmptyStateObjectIllustrationProps,
} from '@aragon/gov-ui-kit';

export interface IDaoProcessAllowedActionsProps {
    /**
     * Network of the DAO process.
     */
    network: Network;
    /**
     * Address of the process.
     */
    plugin: IDaoPlugin;
}

export const DaoProcessAllowedActions: React.FC<IDaoProcessAllowedActionsProps> = (props) => {
    const { network, plugin } = props;

    const { t } = useTranslations();

    const initialParams = {
        urlParams: { network, pluginAddress: plugin.address },
        queryParams: {},
    };
    const { data, status, fetchStatus, isLoading, isFetchingNextPage, fetchNextPage } = useAllowedActions(
        initialParams,
        { enabled: plugin.conditionAddress != null },
    );

    const allowedActionsList = data?.pages.flatMap((page) => page.data);

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const itemsCount = data?.pages[0].metadata.totalRecords;

    const emptyState: IEmptyStateObjectIllustrationProps = {
        isStacked: false,
        heading: t('app.settings.daoProcessAllowedActions.emptyState.heading'),
        description: t('app.settings.daoProcessAllowedActions.emptyState.description'),
        objectIllustration: { object: 'SETTINGS' },
    };

    const chainId = networkDefinitions[network].id;

    return (
        <DataList.Root
            entityLabel=""
            pageSize={isLoading ? 3 : 12}
            onLoadMore={fetchNextPage}
            itemsCount={itemsCount}
            state={plugin.conditionAddress == null ? 'idle' : state}
        >
            <DataList.Container emptyState={emptyState} SkeletonElement={SmartContractFunctionDataListItem.Skeleton}>
                {allowedActionsList?.map((action, index) => (
                    <SmartContractFunctionDataListItem.Structure
                        key={index}
                        contractAddress={action.target}
                        contractName={action.decoded.contractName}
                        functionName={action.decoded.functionName}
                        functionSelector={action.selector ?? undefined}
                        chainId={chainId}
                    />
                ))}
            </DataList.Container>
        </DataList.Root>
    );
};

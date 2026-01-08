import {
    DataList,
    type IEmptyStateObjectIllustrationProps,
    SmartContractFunctionDataListItem,
} from '@aragon/gov-ui-kit';
import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import type { IDaoPlugin, Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { dataListUtils } from '@/shared/utils/dataListUtils';

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

export const DaoProcessAllowedActions: React.FC<
    IDaoProcessAllowedActionsProps
> = (props) => {
    const { network, plugin } = props;

    const { t } = useTranslations();

    const {
        data,
        status,
        fetchStatus,
        isLoading,
        isFetchingNextPage,
        fetchNextPage,
    } = useAllowedActions(
        {
            urlParams: { network, pluginAddress: plugin.address },
            queryParams: {},
        },
        { enabled: plugin.conditionAddress != null },
    );

    const allowedActionsList = data?.pages.flatMap((page) => page.data);
    const hasUnrestrictedAccess = plugin.conditionAddress == null;

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });
    const itemsCount = data?.pages[0].metadata.totalRecords;
    const processedState = hasUnrestrictedAccess ? 'idle' : state;

    const emptyStateContext = hasUnrestrictedAccess
        ? 'unrestricted'
        : 'emptyState';
    const emptyState: IEmptyStateObjectIllustrationProps = {
        isStacked: false,
        heading: t(
            `app.settings.daoProcessAllowedActions.${emptyStateContext}.heading`,
        ),
        description: t(
            `app.settings.daoProcessAllowedActions.${emptyStateContext}.description`,
        ),
        objectIllustration: { object: 'SETTINGS' },
    };

    return (
        <DataList.Root
            entityLabel=""
            itemsCount={itemsCount}
            onLoadMore={fetchNextPage}
            pageSize={isLoading ? 3 : 12}
            state={processedState}
        >
            <DataList.Container
                emptyState={emptyState}
                SkeletonElement={SmartContractFunctionDataListItem.Skeleton}
            >
                {allowedActionsList?.map((action, index) => (
                    <SmartContractFunctionDataListItem.Structure
                        chainId={networkDefinitions[network].id}
                        contractAddress={action.target}
                        contractName={action.decoded.contractName}
                        functionName={action.decoded.functionName}
                        functionSelector={action.selector ?? undefined}
                        key={index}
                    />
                ))}
            </DataList.Container>
        </DataList.Root>
    );
};

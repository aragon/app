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

    const { data, status, fetchStatus, isLoading, isFetchingNextPage, fetchNextPage } = useAllowedActions(
        { urlParams: { network, pluginAddress: plugin.address }, queryParams: {} },
        { enabled: plugin.conditionAddress != null },
    );

    const allowedActionsList = data?.pages.flatMap((page) => page.data);
    const hasUnrestrictedAccess = plugin.conditionAddress == null;

    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });
    const itemsCount = data?.pages[0].metadata.totalRecords;
    const processedState = hasUnrestrictedAccess ? 'idle' : state;

    const emptyStateContext = hasUnrestrictedAccess ? 'unrestricted' : 'emptyState';
    const emptyState: IEmptyStateObjectIllustrationProps = {
        isStacked: false,
        heading: t(`app.settings.daoProcessAllowedActions.${emptyStateContext}.heading`),
        description: t(`app.settings.daoProcessAllowedActions.${emptyStateContext}.description`),
        objectIllustration: { object: 'SETTINGS' },
    };

    return (
        <DataList.Root
            entityLabel=""
            pageSize={isLoading ? 3 : 12}
            onLoadMore={fetchNextPage}
            itemsCount={itemsCount}
            state={processedState}
        >
            <DataList.Container emptyState={emptyState} SkeletonElement={SmartContractFunctionDataListItem.Skeleton}>
                {allowedActionsList?.map((action, index) => (
                    <SmartContractFunctionDataListItem.Structure
                        key={index}
                        contractAddress={action.target}
                        contractName={action.decoded.contractName}
                        functionName={action.decoded.functionName}
                        functionSelector={action.selector ?? undefined}
                        chainId={networkDefinitions[network].id}
                    />
                ))}
            </DataList.Container>
        </DataList.Root>
    );
};

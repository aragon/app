import { useAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { CardEmptyState, DataList, SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';

export interface IDaoProcessAllowedActionsProps {
    /**
     * Network of the DAO process.
     */
    network: Network;
    /**
     * Address of the process.
     */
    pluginAddress: string;
    /**
     * Condition address which indicates whether the process has selected actions allowed.
     */
    conditionAddress?: string;
}

export const DaoProcessAllowedActions: React.FC<IDaoProcessAllowedActionsProps> = (props) => {
    const { network, pluginAddress, conditionAddress } = props;

    const { t } = useTranslations();

    const { data: allowedActionsData } = useAllowedActions(
        { urlParams: { network, pluginAddress }, queryParams: {} },
        { enabled: conditionAddress != null },
    );

    const allAllowedActions = allowedActionsData?.pages.flatMap((page) => page.data);

    const chainId = networkDefinitions[network].id;

    return (
        <>
            {allAllowedActions == null && (
                <CardEmptyState
                    isStacked={false}
                    heading={t('app.settings.daoProcessAllowedActions.emptyState.heading')}
                    description={t('app.settings.daoProcessAllowedActions.emptyState.description')}
                    objectIllustration={{ object: 'SETTINGS' }}
                />
            )}
            {allAllowedActions != null && (
                <DataList.Root entityLabel="" pageSize={10} itemsCount={allAllowedActions.length}>
                    <DataList.Container SkeletonElement={SmartContractFunctionDataListItem.Skeleton}>
                        {allAllowedActions.map((action, index) => (
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
            )}
        </>
    );
};

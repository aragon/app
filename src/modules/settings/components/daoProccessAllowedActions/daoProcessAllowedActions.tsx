import type { IAllowedAction } from '@/modules/governance/api/executeSelectorsService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Card, DataList, EmptyState, SmartContractFunctionDataListItem } from '@aragon/gov-ui-kit';

export interface IDaoProcessAllowedActionsProps {
    /**
     * All allowed actions for the DAO process.
     */
    allAllowedActions: IAllowedAction[];
}

export const DaoProcessAllowedActions: React.FC<IDaoProcessAllowedActionsProps> = (props) => {
    const { allAllowedActions } = props;

    const { t } = useTranslations();

    return (
        <Card className="p-6">
            {allAllowedActions.length === 0 && (
                <EmptyState
                    isStacked={false}
                    heading={t('app.settings.daoProcessDetailsPage.emptyState.heading')}
                    description={t('app.settings.daoProcessDetailsPage.emptyState.description')}
                    objectIllustration={{ object: 'SETTINGS' }}
                />
            )}
            {allAllowedActions.length > 0 && (
                <DataList.Root entityLabel="" pageSize={10} itemsCount={allAllowedActions.length}>
                    <DataList.Container SkeletonElement={SmartContractFunctionDataListItem.Skeleton}>
                        {allAllowedActions.map((action, index) => (
                            <SmartContractFunctionDataListItem.Structure
                                key={index}
                                functionName={action.decoded.functionName}
                                contractAddress={action.target}
                                contractName={action.decoded.contractName}
                            />
                        ))}
                    </DataList.Container>
                </DataList.Root>
            )}
        </Card>
    );
};

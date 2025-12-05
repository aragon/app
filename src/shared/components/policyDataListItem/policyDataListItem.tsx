import { type IDaoPolicy, PolicyStrategyType } from '@/shared/api/daoService';
import { DataList, type IDataListItemProps } from '@aragon/gov-ui-kit';
import { useTranslations } from '../translationsProvider';

export type IPolicyDataListItemProps = IDataListItemProps & {
    /**
     * Policy to display the details for.
     */
    policy: IDaoPolicy;
};

const strategyTypeToNameMap: Record<PolicyStrategyType, string> = {
    [PolicyStrategyType.ROUTER]: 'router',
    [PolicyStrategyType.CLAIMER]: 'claimer',
    [PolicyStrategyType.BURN_ROUTER]: 'burn router',
    [PolicyStrategyType.MULTI_DISPATCH]: 'multi dispatch',
};

export const PolicyDataListItem: React.FC<IPolicyDataListItemProps> = (props) => {
    const { policy, className, ...otherProps } = props;

    const { t } = useTranslations();

    const { name, description, policyKey, strategy } = policy;

    const processedName =
        name != null && name.length > 0
            ? name
            : t('app.shared.policyDataListItem.defaultName', { type: strategyTypeToNameMap[strategy.type] });
    const processedDescription =
        description != null && description.length > 0
            ? description
            : t('app.shared.policyDataListItem.defaultDescription');

    return (
        <DataList.Item key={policy.address} className="px-4 py-3 md:p-6" {...otherProps}>
            <div className="flex flex-col gap-y-1">
                <div className="flex gap-2 text-lg leading-tight font-normal">
                    <p className="truncate text-neutral-800">{processedName}</p>
                    {policyKey && <p className="text-right text-neutral-500 uppercase">{policyKey}</p>}
                </div>
                <p className="line-clamp-2 text-base leading-normal font-normal text-neutral-500">
                    {processedDescription}
                </p>
            </div>
        </DataList.Item>
    );
};

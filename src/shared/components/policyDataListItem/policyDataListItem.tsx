import { DataList, type IDataListItemProps } from '@aragon/gov-ui-kit';
import { type IDaoPolicy, PolicyStrategyType } from '@/shared/api/daoService';
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
    const { policy, ...otherProps } = props;

    const { t } = useTranslations();

    const { name, description, policyKey, strategy } = policy;

    const processedName =
        name != null && name.length > 0
            ? name
            : t('app.shared.policyDataListItem.defaultName', {
                  type: strategyTypeToNameMap[strategy.type],
              });
    const processedDescription =
        description != null && description.length > 0 ? description : t('app.shared.policyDataListItem.defaultDescription');

    return (
        <DataList.Item className="px-4 py-3 md:p-6" key={policy.address} {...otherProps}>
            <div className="flex flex-col gap-y-1">
                <div className="flex gap-2 font-normal text-lg leading-tight">
                    <p className="truncate text-neutral-800">{processedName}</p>
                    {policyKey && <p className="text-right text-neutral-500 uppercase">{policyKey}</p>}
                </div>
                <p className="line-clamp-2 font-normal text-base text-neutral-500 leading-normal">{processedDescription}</p>
            </div>
        </DataList.Item>
    );
};

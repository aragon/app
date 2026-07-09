import { DataList, type IDataListItemProps } from '@aragon/gov-ui-kit';
import type { IDao, IDaoPolicy } from '@/shared/api/daoService';
import { DaoTargetIndicator } from '@/shared/components/daoTargetIndicator';
import { policyDisplayUtils } from '@/shared/utils/policyDisplayUtils';
import { useTranslations } from '../translationsProvider';

export type IPolicyDataListItemProps = IDataListItemProps & {
    /**
     * Policy to display the details for.
     */
    policy: IDaoPolicy;
    /**
     * Parent DAO used to show target indicator when applicable.
     */
    dao?: IDao;
};

export const PolicyDataListItem: React.FC<IPolicyDataListItemProps> = (
    props,
) => {
    const { policy, dao, ...otherProps } = props;

    const { t } = useTranslations();

    const { name, description, policyKey, daoAddress } = policy;

    const labelKey = policyDisplayUtils.getPolicyRouterTypeLabelKey(policy);
    const processedName =
        name != null && name.length > 0
            ? name
            : t('app.shared.policyDataListItem.defaultName', {
                  type: t(labelKey).toLowerCase(),
              });
    const processedDescription =
        description != null && description.length > 0
            ? description
            : t('app.shared.policyDataListItem.defaultDescription');

    return (
        <DataList.Item
            className="px-4 py-3 md:p-6"
            key={policy.address}
            {...otherProps}
        >
            <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex flex-col gap-y-1">
                    <div className="flex gap-2 font-normal text-base leading-tight md:text-lg">
                        <p className="truncate text-neutral-800">
                            {processedName}
                        </p>
                        {policyKey && (
                            <p className="shrink-0 text-right text-neutral-500 uppercase">
                                {policyKey}
                            </p>
                        )}
                    </div>
                    <p className="line-clamp-2 font-normal text-neutral-500 text-sm leading-normal md:text-base">
                        {processedDescription}
                    </p>
                </div>
                <DaoTargetIndicator
                    dao={dao}
                    size="sm"
                    targetDaoAddress={daoAddress}
                />
            </div>
        </DataList.Item>
    );
};

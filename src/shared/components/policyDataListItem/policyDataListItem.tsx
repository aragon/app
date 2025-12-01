import type { IDaoPolicy } from '@/shared/api/daoService';
import { DataList, type IDataListItemProps } from '@aragon/gov-ui-kit';
import { useTranslations } from '../translationsProvider';

export type IPolicyDataListItemProps = IDataListItemProps & {
    /**
     * Policy to display the details for.
     */
    policy: IDaoPolicy;
};

export const PolicyDataListItem: React.FC<IPolicyDataListItemProps> = (props) => {
    const { policy, className, ...otherProps } = props;

    const { t } = useTranslations();

    const { name, description, policyKey } = policy;
    const processedDescription =
        description != null && description.length > 0
            ? description
            : t('app.shared.policyDataListItem.defaultDescription');

    return (
        <DataList.Item key={policy.address} className="px-4 py-3 md:p-6" {...otherProps}>
            <div className="flex flex-col gap-y-1">
                <div className="flex gap-2 text-lg leading-tight font-normal">
                    <p className="truncate text-neutral-800">{name}</p>
                    {policyKey && <p className="text-right text-neutral-500 uppercase">{policyKey}</p>}
                </div>
                <p className="line-clamp-2 text-base leading-normal font-normal text-neutral-500">
                    {processedDescription}
                </p>
            </div>
        </DataList.Item>
    );
};

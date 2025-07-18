import type { IDaoPlugin } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DataList, type IDataListItemProps } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useTranslations } from '../translationsProvider';

export type IProcessDataListItemProps = IDataListItemProps & {
    /**
     * Process to display the details for.
     */
    process: IDaoPlugin;
    /**
     * Renders the process as active when set to true.
     */
    isActive?: boolean;
};

export const ProcessDataListItem: React.FC<IProcessDataListItemProps> = (props) => {
    const { process, isActive, className, ...otherProps } = props;

    const { t } = useTranslations();

    const { address, description, slug } = process;
    const processedDescription =
        description != null && description.length > 0
            ? description
            : t('app.shared.processDataListItem.defaultDescription');

    return (
        <DataList.Item
            key={address}
            className={classNames('px-4 py-3 md:p-6', {
                'border-primary-400 shadow-primary hover:border-primary-400 hover:shadow-primary': isActive,
            })}
            {...otherProps}
        >
            <div className="flex flex-col gap-y-1">
                <div className="flex gap-2 text-lg leading-tight font-normal">
                    <p className="text-neutral-800">{daoUtils.getPluginName(process)}</p>
                    <p className="text-right text-neutral-500 uppercase">{slug}</p>
                </div>
                <p className="line-clamp-2 text-base leading-normal font-normal text-neutral-500">
                    {processedDescription}
                </p>
            </div>
        </DataList.Item>
    );
};

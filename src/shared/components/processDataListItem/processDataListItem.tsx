import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { subDaoDisplayUtils } from '@/shared/utils/subDaoDisplayUtils';
import { DataList, type IDataListItemProps } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useTranslations } from '../translationsProvider';
import { DaoBreadcrumbs, buildDaoBreadcrumbPath } from './daoBreadcrumbs';

export type IProcessDataListItemProps = IDataListItemProps & {
    /**
     * Process to display the details for.
     */
    process: IDaoPlugin;
    /**
     * Renders the process as active when set to true.
     */
    isActive?: boolean;
    /**
     * Parent DAO used to show SubDAO breadcrumbs when applicable.
     */
    dao?: IDao;
};

export const ProcessDataListItem: React.FC<IProcessDataListItemProps> = (props) => {
    const { process, isActive, className, dao, ...otherProps } = props;

    const { t } = useTranslations();

    const { address, description, slug } = process;
    const targetDaoAddress = subDaoDisplayUtils.getPluginDaoAddress(process);
    const daoPath = buildDaoBreadcrumbPath({ rootDao: dao, targetAddress: targetDaoAddress });

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
                    <p className="truncate text-neutral-800">{daoUtils.getPluginName(process)}</p>
                    <p className="text-right text-neutral-500 uppercase">{slug}</p>
                </div>
                <p className="line-clamp-2 text-base leading-normal font-normal text-neutral-500">
                    {processedDescription}
                </p>
                <DaoBreadcrumbs path={daoPath} />
            </div>
        </DataList.Item>
    );
};

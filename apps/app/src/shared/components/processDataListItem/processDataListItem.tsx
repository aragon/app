import { DataList, type IDataListItemProps, Link } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { DaoTargetIndicator } from '@/shared/components/daoTargetIndicator';
import { daoUtils } from '@/shared/utils/daoUtils';
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
    /**
     * Renders the process as disabled when set to true.
     */
    isDisabled?: boolean;
    /**
     * Parent DAO used to show linked account breadcrumbs when applicable.
     */
    dao?: IDao;
    /**
     * Displays a help text that the connected user is not eligible to create proposals in this process.
     */
    showNotEligibleHelpText?: boolean;
};

export const ProcessDataListItem: React.FC<IProcessDataListItemProps> = (
    props,
) => {
    const {
        process,
        isActive,
        isDisabled,
        dao,
        showNotEligibleHelpText,
        ...otherProps
    } = props;

    const { t } = useTranslations();

    const { address, description, slug } = process;

    const processedDescription =
        description != null && description.length > 0
            ? description
            : t('app.shared.processDataListItem.defaultDescription');

    const processSettingsUrls = daoUtils.getDaoUrl(
        dao,
        `settings/${slug}/#proposal-creation-eligibility`,
    )!;

    return (
        <DataList.Item
            className={classNames('px-4 py-3 md:p-6', {
                'border-primary-400 shadow-primary hover:border-primary-400 hover:shadow-primary':
                    isActive,
                'border-neutral-100 bg-neutral-50': isDisabled,
            })}
            key={address}
            {...otherProps}
            {...(isDisabled ? { onClick: undefined } : {})}
        >
            <div className="flex flex-col gap-3 md:gap-4">
                <div
                    className={classNames('flex flex-col gap-3 md:gap-4', {
                        'opacity-40': isDisabled,
                    })}
                >
                    <div className="flex flex-col gap-y-1">
                        <div className="flex gap-2 font-normal text-base leading-tight md:text-lg">
                            <p className="truncate text-neutral-800">
                                {daoUtils.getPluginName(process)}
                            </p>
                            <p className="text-right text-neutral-500 uppercase">
                                {slug}
                            </p>
                        </div>
                        <p className="line-clamp-2 font-normal text-neutral-500 text-sm leading-normal md:text-base">
                            {processedDescription}
                        </p>
                    </div>
                    <DaoTargetIndicator dao={dao} plugin={process} size="sm" />
                </div>
                {showNotEligibleHelpText && (
                    <div className="text-neutral-400 text-sm md:text-base">
                        {t('app.shared.processDataListItem.notEligible')} -{' '}
                        <Link href={processSettingsUrls} isExternal={true}>
                            {t(
                                'app.shared.processDataListItem.viewRequirements',
                            )}
                        </Link>
                    </div>
                )}
            </div>
        </DataList.Item>
    );
};

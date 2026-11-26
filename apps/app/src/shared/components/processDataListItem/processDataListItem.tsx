import { DataList, type IDataListItemProps, Link } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { DaoTargetIndicator } from '@/shared/components/daoTargetIndicator';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useTranslations } from '../translationsProvider';

/**
 * Hash anchor of the proposal-creation eligibility section on the process
 * settings page. Appended to the settings link so the settings page scrolls the
 * section into view once it has rendered.
 */
export const proposalCreationEligibilityAnchor =
    'proposal-creation-eligibility';

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

    const processDescription =
        description != null && description.length > 0 ? description : undefined;

    return (
        <DataList.Item
            className={classNames('px-4 py-3 md:p-6', {
                'border-surface-selected shadow-accent-default! hover:border-surface-selected':
                    isActive,
                'border-surface-disabled-item bg-surface-secondary': isDisabled,
            })}
            key={address}
            {...otherProps}
            {...(isDisabled ? { onClick: undefined } : {})}
        >
            <div className="flex flex-col gap-3 md:gap-4">
                <div
                    className={classNames('flex flex-col gap-3 md:gap-4', {
                        'opacity-60': isDisabled,
                    })}
                >
                    <div className="flex flex-col gap-y-1">
                        <div className="flex gap-2 type-title-item">
                            <p className="truncate text-surface-primary">
                                {daoUtils.getPluginName(process)}
                            </p>
                            <p className="text-right text-surface-secondary uppercase">
                                {slug}
                            </p>
                        </div>
                        {processDescription && (
                            <p className="line-clamp-2 type-body-compact text-surface-secondary">
                                {processDescription}
                            </p>
                        )}
                    </div>
                    <DaoTargetIndicator dao={dao} plugin={process} size="sm" />
                </div>
                {showNotEligibleHelpText && (
                    <div className="type-supporting--framework-leading text-surface-tertiary-hint">
                        {t('app.shared.processDataListItem.notEligible')} •{' '}
                        <Link
                            href={daoUtils.getDaoUrl(
                                dao,
                                `settings/${slug}#${proposalCreationEligibilityAnchor}`,
                            )}
                            isExternal={true}
                        >
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

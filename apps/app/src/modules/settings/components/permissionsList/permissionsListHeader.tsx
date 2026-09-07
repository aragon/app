import { Icon, IconType } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PermissionsListHeaderLabel } from './permissionsListHeaderLabel';

export const PermissionsListHeader: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="sticky top-[90px] z-20 hidden md:block">
            <div className="flex items-baseline justify-between gap-x-4 bg-gradient-to-b from-90% from-neutral-50 to-transparent px-4 pt-1 pb-4 text-neutral-500 text-sm md:gap-x-6 md:px-6">
                <div className="grid w-full grid-cols-4 gap-4">
                    <PermissionsListHeaderLabel
                        labelKey="app.settings.permissionsList.header.who"
                        tooltipKey="app.settings.permissionsList.header.whoTooltip"
                        tooltipLabelKey="app.settings.permissionsList.header.whoTooltipLabel"
                    />
                    <PermissionsListHeaderLabel
                        labelKey="app.settings.permissionsList.header.where"
                        tooltipKey="app.settings.permissionsList.header.whereTooltip"
                        tooltipLabelKey="app.settings.permissionsList.header.whereTooltipLabel"
                    />
                    <span>
                        {t('app.settings.permissionsList.header.permission')}
                    </span>
                    <span>
                        {t('app.settings.permissionsList.header.condition')}
                    </span>
                </div>
                <span
                    aria-hidden="true"
                    className="invisible inline-flex shrink-0"
                >
                    <Icon icon={IconType.CHEVRON_DOWN} size="sm" />
                </span>
            </div>
        </div>
    );
};

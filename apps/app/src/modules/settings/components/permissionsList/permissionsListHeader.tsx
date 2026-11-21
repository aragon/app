import { Icon, IconType } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { PermissionsListHeaderLabel } from './permissionsListHeaderLabel';

export const PermissionsListHeader: React.FC = () => {
    const { t } = useTranslations();

    return (
        <div className="sticky top-[90px] z-20 hidden md:block">
            <div className="flex items-baseline justify-between gap-x-group-stepped bg-gradient-to-b from-neutral-50 from-90% to-transparent px-inset-item pt-inset-tight--fixed-4 pb-inset-item-flat--fixed-16 text-sm text-neutral-500">
                <div className="grid w-full grid-cols-4 gap-group">
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

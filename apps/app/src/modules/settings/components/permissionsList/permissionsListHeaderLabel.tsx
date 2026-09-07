import { useTranslations } from '@/shared/components/translationsProvider';
import { PermissionInfoTooltip } from '../permissionInfoTooltip';

interface IPermissionsListHeaderLabelProps {
    labelKey: string;
    tooltipKey: string;
    tooltipLabelKey: string;
}

export const PermissionsListHeaderLabel: React.FC<
    IPermissionsListHeaderLabelProps
> = ({ labelKey, tooltipKey, tooltipLabelKey }) => {
    const { t } = useTranslations();

    return (
        <span className="flex min-w-0 items-center gap-1">
            <span className="truncate">{t(labelKey)}</span>
            <PermissionInfoTooltip
                tooltipKey={tooltipKey}
                tooltipLabelKey={tooltipLabelKey}
            />
        </span>
    );
};

import { Icon, IconType, Tooltip } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IPermissionInfoTooltipProps {
    /**
     * Locale key for the tooltip body.
     */
    tooltipKey: string;
    /**
     * Locale key for the tooltip's accessible label prefix (rendered into the
     * `aria-label` as `<tooltipLabelKey>: <tooltip>`).
     */
    tooltipLabelKey: string;
}

/**
 * Shared info-icon tooltip used by the permissions page filter switches and
 * the list column-header labels. Renders the kit `INFO` icon inside the kit
 * `Tooltip`, with an `aria-label` of the form `<label>: <tooltip body>`.
 */
export const PermissionInfoTooltip: React.FC<IPermissionInfoTooltipProps> = ({
    tooltipKey,
    tooltipLabelKey,
}) => {
    const { t } = useTranslations();
    const tooltip = t(tooltipKey);

    return (
        <Tooltip content={tooltip} triggerAsChild={true}>
            <span
                aria-label={`${t(tooltipLabelKey)}: ${tooltip}`}
                className="inline-flex size-5 shrink-0 cursor-help items-center justify-center text-neutral-400 leading-none"
                role="img"
            >
                <Icon icon={IconType.INFO} size="sm" />
            </span>
        </Tooltip>
    );
};

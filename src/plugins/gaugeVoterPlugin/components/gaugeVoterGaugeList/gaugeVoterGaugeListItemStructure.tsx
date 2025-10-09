import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { addressUtils, Avatar, Button, DataList, formatterUtils, IconType, NumberFormat } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { IGauge } from '../../api/gaugeVoterService/domain';

export interface IGaugeVoterGaugeListItemStructureProps {
    /**
     * Gauge data to display.
     */
    gauge: IGauge;
    /**
     * Total votes across all gauges for percentage calculation.
     */
    totalEpochVotes?: number;
    /**
     * Whether this gauge is currently selected for voting.
     */
    isSelected?: boolean;
    /**
     * Whether this gauge has already been voted on.
     */
    isVoted?: boolean;
    /**
     * Function to handle gauge selection/deselection.
     */
    onSelect: (gauge: IGauge) => void;
    /**
     * Function to handle viewing gauge details.
     */
    onViewDetails?: (gauge: IGauge) => void;
    /**
     * Whether the user is connected.
     */
    isUserConnected: boolean;
    /**
     * Whether voting is active.
     */
    isVotingActive: boolean;
}

export const GaugeVoterGaugeListItemStructure: React.FC<IGaugeVoterGaugeListItemStructureProps> = (props) => {
    const { gauge, totalEpochVotes, isSelected, isVoted, onSelect, onViewDetails, isUserConnected, isVotingActive } =
        props;
    const { t } = useTranslations();

    const formattedTotalVotes = formatterUtils.formatNumber(gauge.totalVotes, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });
    const formattedUserVotes = !isUserConnected
        ? '-'
        : gauge.userVotes > 0
          ? formatterUtils.formatNumber(gauge.userVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })
          : t('app.plugins.gaugeVoter.gaugeVoterGaugeList.item.noVotes');

    // Calculate percentage if total epoch votes is available
    const percentage = totalEpochVotes && totalEpochVotes > 0 ? (gauge.totalVotes / totalEpochVotes) * 100 : 0;
    const formattedPercentage = totalEpochVotes
        ? formatterUtils.formatNumber(percentage, { format: NumberFormat.PERCENTAGE_SHORT })
        : null;

    const truncatedAddress = addressUtils.truncateAddress(gauge.address);

    const handleActionClick = (event: React.MouseEvent) => {
        event.stopPropagation();
        if (isVoted) {
            return;
        }

        onSelect(gauge);
    };

    const avatarFallback = (
        <span className="bg-primary-400 text-neutral-0 flex size-full items-center justify-center">
            {gauge.name.slice(0, 2).toUpperCase()}
        </span>
    );

    const actionButtonTranslationKey = isVoted ? 'voted' : isSelected ? 'selected' : 'select';

    const itemClassName = classNames('flex min-h-20 items-center gap-4 px-6 py-3', {
        'border-primary-300 hover:border-primary-300': isSelected,
    });

    return (
        <DataList.Item className={itemClassName} onClick={() => onViewDetails?.(gauge)}>
            {/* Header - Name and Address */}
            <div className="flex min-w-0 grow basis-0 items-center gap-4">
                <Avatar alt="Gauge icon" size="lg" fallback={avatarFallback} src={gauge.logo ?? undefined} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-lg text-neutral-800">{gauge.name}</p>
                    <p className="truncate text-sm text-neutral-500">{truncatedAddress}</p>
                </div>
            </div>

            <div className="flex grow basis-0 flex-col gap-1 text-right">
                <p className="text-lg text-neutral-800">{formattedTotalVotes} votes</p>
                <p className="text-sm text-neutral-500">
                    {formattedPercentage ? `${formattedPercentage} of total` : '-- of total'}
                </p>
            </div>

            <div className="flex min-h-11 grow basis-0 flex-col items-end">
                <div className="flex items-center justify-end gap-2">
                    <p className="text-right text-lg text-neutral-500">{formattedUserVotes}</p>
                </div>
            </div>

            <div className="flex w-30 items-center justify-end md:w-36">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleActionClick}
                    iconLeft={isVoted ? IconType.CHECKMARK : isSelected ? IconType.CHECKMARK : undefined}
                    disabled={!isVotingActive}
                >
                    {t(`app.plugins.gaugeVoter.gaugeVoterGaugeList.item.${actionButtonTranslationKey}`)}
                </Button>
            </div>
        </DataList.Item>
    );
};

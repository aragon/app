import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { addressUtils, Avatar, Button, DataList, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
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
     * Function to handle gauge voting.
     */
    onVote?: (gauge: IGauge) => void;
    /**
     * Function to handle viewing gauge details.
     */
    onViewDetails?: (gauge: IGauge) => void;
}

export const GaugeVoterGaugeListItemStructure: React.FC<IGaugeVoterGaugeListItemStructureProps> = (props) => {
    const { gauge, totalEpochVotes, onVote, onViewDetails } = props;
    const { t } = useTranslations();

    const formattedTotalVotes = formatterUtils.formatNumber(gauge.totalVotes, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });
    const formattedUserVotes =
        gauge.userVotes > 0
            ? formatterUtils.formatNumber(gauge.userVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })
            : t('app.plugins.gaugeVoter.gaugeVoterGaugeList.item.noVotes');

    // Calculate percentage if total epoch votes is available
    const percentage = totalEpochVotes && totalEpochVotes > 0 ? (gauge.totalVotes / totalEpochVotes) * 100 : 0;
    const formattedPercentage = totalEpochVotes
        ? formatterUtils.formatNumber(percentage, { format: NumberFormat.PERCENTAGE_SHORT })
        : null;

    const truncatedAddress = addressUtils.truncateAddress(gauge.address);

    // const handleVoteClick = () => {
    //     if (onVote) {
    //         onVote(gauge);
    //     }
    // };

    const avatarFallback = (
        <span className="bg-primary-400 text-neutral-0 flex size-full items-center justify-center">
            {gauge.name.slice(0, 2).toUpperCase()}
        </span>
    );

    return (
        <DataList.Item className="flex min-h-20 items-center gap-4 px-6 py-3" onClick={() => onViewDetails?.(gauge)}>
            {/* Header - Name and Address */}
            <div className="flex min-w-0 grow basis-0 items-center gap-4">
                <Avatar alt="Gauge icon" size="lg" fallback={avatarFallback} src={gauge.logo} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="text-lg text-neutral-800">{gauge.name}</p>
                    <p className="truncate text-sm text-neutral-500">{truncatedAddress}</p>
                </div>
            </div>

            {/* Total Votes */}
            <div className="flex grow basis-0 flex-col gap-1 text-right">
                <p className="text-lg text-neutral-800">{formattedTotalVotes} votes</p>
                <p className="text-sm text-neutral-500">
                    {formattedPercentage ? `${formattedPercentage} of total` : '-- of total'}
                </p>
            </div>

            {/* User Votes */}
            <div className="flex min-h-11 grow basis-0 flex-col items-end">
                <div className="flex items-center justify-end gap-2">
                    <p className="text-right text-lg text-neutral-500">{formattedUserVotes}</p>
                </div>
            </div>

            {/* Actions */}
            {onVote && (
                <div className="flex w-36 items-center justify-end pl-8">
                    <Button size="sm" variant="tertiary">
                        {t('app.plugins.gaugeVoter.gaugeVoterGaugeList.item.select')}
                    </Button>
                </div>
            )}
        </DataList.Item>
    );
};

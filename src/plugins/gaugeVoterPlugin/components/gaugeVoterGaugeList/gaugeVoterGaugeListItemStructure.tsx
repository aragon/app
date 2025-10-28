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
    isVotingPeriod: boolean;
    /**
     * Token symbol for voting power display.
     */
    tokenSymbol: string;
    /**
     * MOCK DATA - User's votes on this gauge (temporary until blockchain integration).
     */
    userVotes: number;
}

export const GaugeVoterGaugeListItemStructure: React.FC<IGaugeVoterGaugeListItemStructureProps> = (props) => {
    const {
        gauge,
        totalEpochVotes,
        isSelected,
        isVoted,
        onSelect,
        onViewDetails,
        isUserConnected,
        isVotingPeriod,
        tokenSymbol,
        userVotes,
    } = props;
    const { t } = useTranslations();

    const gaugeTotalVotes = gauge.metrics.totalMemberVoteCount;
    const formattedTotalVotes = formatterUtils.formatNumber(gaugeTotalVotes, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    // Use mock user votes passed from parent (will be replaced with blockchain reads)
    const formattedUserVotes = !isUserConnected
        ? '-'
        : userVotes > 0
          ? formatterUtils.formatNumber(userVotes, { format: NumberFormat.TOKEN_AMOUNT_SHORT })
          : t('app.plugins.gaugeVoter.gaugeVoterGaugeList.item.noVotes');

    // Calculate percentage if total epoch votes is available
    const percentage = totalEpochVotes && totalEpochVotes > 0 ? gaugeTotalVotes / totalEpochVotes : 0;
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

    const gaugeName = gauge.name ?? addressUtils.truncateAddress(gauge.address);
    const avatarFallback = (
        <span className="bg-primary-400 text-neutral-0 flex size-full items-center justify-center">
            {gaugeName.slice(0, 2).toUpperCase()}
        </span>
    );

    const actionButtonTranslationKey = isVoted ? 'voted' : isSelected ? 'selected' : 'select';

    const itemClassName = classNames(
        'flex flex-col gap-3 px-4 py-3 md:min-h-20 md:flex-row md:items-center md:gap-4 md:px-6',
        {
            'border-primary-300 hover:border-primary-300': isSelected,
        },
    );

    return (
        <DataList.Item className={itemClassName} onClick={() => onViewDetails?.(gauge)}>
            {/* Top section on mobile - Gauge info with border bottom */}
            <div className="flex min-w-0 grow items-center gap-3 border-b border-neutral-100 pb-3 md:basis-0 md:gap-4 md:border-b-0 md:pb-0">
                <Avatar
                    alt="Gauge icon"
                    size="md"
                    responsiveSize={{ md: 'lg' }}
                    fallback={avatarFallback}
                    src={gauge.avatar ?? undefined}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-base text-neutral-800 md:text-lg">{gaugeName}</p>
                    <p className="truncate text-sm text-neutral-500">{truncatedAddress}</p>
                </div>
            </div>

            {/* Middle section on mobile - Total votes and Your votes side by side */}
            <div className="flex items-start justify-between gap-4 md:contents">
                <div className="flex flex-col gap-1 md:grow md:basis-0 md:text-right">
                    <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase md:hidden">
                        {t('app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.totalVotes')}
                    </p>
                    <p className="text-base text-neutral-800 md:text-lg">
                        {formattedTotalVotes} {t('app.plugins.gaugeVoter.gaugeVoterGaugeList.item.votes')}
                    </p>
                    <p className="text-sm text-neutral-500">
                        {formattedPercentage ? `${formattedPercentage} of total` : '-- of total'}
                    </p>
                </div>

                <div className="flex flex-col gap-1 text-right md:grow md:basis-0">
                    <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase md:hidden">
                        {t('app.plugins.gaugeVoter.gaugeVoterGaugeList.heading.yourVotes')}
                    </p>
                    <div className="flex min-h-11 flex-col items-end md:justify-center">
                        <div className="flex items-baseline justify-end gap-1">
                            {formattedUserVotes === '-' ||
                            formattedUserVotes === t('app.plugins.gaugeVoter.gaugeVoterGaugeList.item.noVotes') ? (
                                <p className="text-right text-base text-neutral-500 md:text-lg">{formattedUserVotes}</p>
                            ) : (
                                <>
                                    <span className="text-base text-neutral-800 md:text-lg">{formattedUserVotes}</span>
                                    <span className="text-sm text-neutral-500 md:text-base">{tokenSymbol}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Button section - full width on mobile */}
            <div className="flex w-full items-center justify-end md:w-36">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleActionClick}
                    iconLeft={isVoted ? IconType.CHECKMARK : isSelected ? IconType.CHECKMARK : undefined}
                    disabled={!isVotingPeriod}
                    className="w-full md:w-auto"
                >
                    {t(`app.plugins.gaugeVoter.gaugeVoterGaugeList.item.${actionButtonTranslationKey}`)}
                </Button>
            </div>
        </DataList.Item>
    );
};

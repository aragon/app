import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';

export interface IGaugeVoterVotingStatsProps {
    /**
     * Number of days left to vote in the current epoch.
     */
    daysLeftToVote: number;
    /**
     * Formatted total voting power of the epoch.
     */
    formattedEpochVotingPower: string;
    /**
     * Formatted user's total voting power.
     */
    formattedUserVotingPower: string;
    /**
     * Usage percentage (0-1).
     */
    usagePercentage: number;
    /**
     * Whether the user is connected.
     */
    isUserConnected: boolean;
}

export const GaugeVoterVotingStats: React.FC<IGaugeVoterVotingStatsProps> = (
    props,
) => {
    const {
        daysLeftToVote,
        formattedEpochVotingPower,
        formattedUserVotingPower,
        usagePercentage,
        isUserConnected,
    } = props;

    const { t } = useTranslations();

    const formattedUsagePercentage = formatterUtils.formatNumber(
        usagePercentage,
        {
            format: NumberFormat.PERCENTAGE_SHORT,
        },
    );

    const stats = [
        {
            value: (daysLeftToVote || 0).toString(),
            suffix: t(
                'app.plugins.gaugeVoter.gaugeVoterVotingStats.daysLeftSuffix',
            ),
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.toVote'),
        },
        {
            value: formattedEpochVotingPower,
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.totalVotes'),
        },
        {
            value: isUserConnected ? formattedUserVotingPower : '-',
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.yourVotes'),
        },
        {
            value: isUserConnected ? (formattedUsagePercentage ?? '0%') : '-',
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.usedVotes'),
        },
    ];

    return (
        <div className="grid w-full grid-cols-2 gap-3">
            {stats.map(({ label, value, suffix }) => (
                <StatCard
                    key={label}
                    label={label}
                    suffix={suffix}
                    value={value}
                />
            ))}
        </div>
    );
};

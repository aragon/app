import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';

export interface IGaugeVoterVotingStatsProps {
    /**
     * Number of days left to vote in the current epoch.
     */
    daysLeftToVote: number;
    /**
     * Total voting power available to the user.
     */
    totalVotingPower: string;
    /**
     * Total voting power already allocated by the user.
     */
    allocatedVotingPower: string;
    /**
     * Number of active gauges the user is voting for.
     */
    activeVotes: number;
    /**
     * Whether the user is connected.
     */
    isUserConnected: boolean;
}

export const GaugeVoterVotingStats: React.FC<IGaugeVoterVotingStatsProps> = (props) => {
    const { daysLeftToVote, totalVotingPower, allocatedVotingPower, isUserConnected } = props;

    const { t } = useTranslations();

    const totalPower = parseFloat(totalVotingPower || '0');
    const allocatedPower = parseFloat(allocatedVotingPower || '0');

    const usagePercentage = !isUserConnected
        ? '-'
        : totalPower > 0
          ? Math.round((allocatedPower / totalPower) * 100)
          : 0;

    const stats = [
        {
            value: (daysLeftToVote || 0).toString(),
            suffix: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.daysLeftSuffix'),
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.toVote'),
        },
        {
            value: totalVotingPower || '0',
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.totalVotes'),
        },
        {
            value: !isUserConnected ? '-' : allocatedVotingPower || '0',
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.yourVotes'),
        },
        {
            value: usagePercentage.toString(),
            suffix: isUserConnected ? '%' : undefined,
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.usedVotes'),
        },
    ];

    return (
        <div className="grid w-full grid-cols-2 gap-3">
            {stats.map(({ label, value, suffix }) => (
                <StatCard key={label} value={value} suffix={suffix} label={label} />
            ))}
        </div>
    );
};

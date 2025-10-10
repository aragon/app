import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';

export interface IGaugeVoterVotingStatsProps {
    /**
     * Number of days left to vote in the current epoch.
     */
    daysLeftToVote: number;
    /**
     * Total voting power of the epoch.
     */
    epochVotingPower: string;
    /**
     * Total voting power already allocated by the user.
     */
    userVotingPower: string;
    /**
     * Total voting power already allocated by the user.
     */
    userUsedVotingPower: string;
    /**
     * Whether the user is connected.
     */
    isUserConnected: boolean;
}

export const GaugeVoterVotingStats: React.FC<IGaugeVoterVotingStatsProps> = (props) => {
    const { daysLeftToVote, epochVotingPower, userVotingPower, userUsedVotingPower, isUserConnected } = props;

    const { t } = useTranslations();

    const usagePercentage = (Number(userUsedVotingPower) / Number(userVotingPower)) * 100;

    const stats = [
        {
            value: (daysLeftToVote || 0).toString(),
            suffix: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.daysLeftSuffix'),
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.toVote'),
        },
        {
            value: formatterUtils.formatNumber(epochVotingPower, { format: NumberFormat.GENERIC_SHORT }) ?? '0',
            label: t('app.plugins.gaugeVoter.gaugeVoterVotingStats.totalVotes'),
        },
        {
            value: !isUserConnected ? '-' : userVotingPower || '0',
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

import {
    CampaignStatus,
    useCampaignList,
    useCampaignStats,
} from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { DateFormat, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface ICapitalDistributorRewardsStatsProps {}

export const CapitalDistributorRewardsStats: React.FC<ICapitalDistributorRewardsStatsProps> = () => {
    const { t } = useTranslations();
    const { address } = useAccount();

    const campaignParams = { queryParams: { memberAddress: address! } };
    const { data: campaignData } = useCampaignList(campaignParams, { enabled: address != null });
    const campaigns = campaignData?.pages.flatMap((page) => page.data);
    console.log(campaignData);
    const claimableCampaigns = campaigns?.filter((campaign) => campaign.status === CampaignStatus.CLAIMABLE);
    const claimedCampaigns = campaigns?.filter((campaign) => campaign.status === CampaignStatus.CLAIMED);

    const campaignStatsParams = { urlParams: { memberAddress: address! } };
    const { data: campaignStats } = useCampaignStats(campaignStatsParams, { enabled: address != null });

    // Assuming backend returns sorted by default
    const latestClaimedCampaign = claimedCampaigns?.[0];
    const latestClaimDate = latestClaimedCampaign?.claimTimestamp
        ? latestClaimedCampaign.claimTimestamp * 1000
        : undefined;

    const formattedClaimDate = formatterUtils.formatDate(latestClaimDate, { format: DateFormat.RELATIVE });

    const [claimDateValue, claimDateUnit] = formattedClaimDate?.split(' ') ?? [undefined, undefined];
    const claimDateSuffix = t('app.governance.proposalListStats.recentUnit', { unit: claimDateUnit });

    const formattedTotalClaimed = formatterUtils.formatNumber(campaignStats?.totalClaimed, {
        format: NumberFormat.FIAT_TOTAL_SHORT,
    });
    const formattedTotalClaimable = formatterUtils.formatNumber(campaignStats?.totalClaimable, {
        format: NumberFormat.FIAT_TOTAL_SHORT,
    });

    const stats = [
        {
            value: formattedTotalClaimed ?? '-',
            label: t('app.plugins.capitalDistributor.capitalDistributorRewardsAside.stats.totalEarned'),
        },
        {
            value: formattedTotalClaimable ?? '-',
            label: t('app.plugins.capitalDistributor.capitalDistributorRewardsAside.stats.claimableNow'),
        },
        {
            value: claimableCampaigns?.length ?? '-',
            label: t('app.plugins.capitalDistributor.capitalDistributorRewardsAside.stats.claimableCount'),
        },
        {
            value: claimDateValue ?? '-',
            suffix: claimDateUnit ? claimDateSuffix : undefined,
            label: t('app.plugins.capitalDistributor.capitalDistributorRewardsAside.stats.latestClaim'),
        },
    ];
    return (
        <div className="grid w-full grid-cols-2 gap-3">
            {stats.map((stat) => (
                <StatCard key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
        </div>
    );
};

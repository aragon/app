import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { DateFormat, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import {
    CampaignStatus,
    type IGetCampaignsListParams,
    useCampaignList,
    useCampaignStats,
} from '../../api/capitalDistributorService';

export interface ICapitalDistributorRewardsStatsProps {
    /**
     * Initial parameters for the campaign list query.
     */
    initialParams?: IGetCampaignsListParams;
}

export const CapitalDistributorRewardsStats: React.FC<ICapitalDistributorRewardsStatsProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const { address } = useAccount();

    const claimableCampaignParams = {
        queryParams: { ...initialParams?.queryParams, memberAddress: address!, status: CampaignStatus.CLAIMABLE },
    };
    const { data: claimableCampaignData } = useCampaignList(claimableCampaignParams, { enabled: address != null });

    const claimedCampaignParams = {
        queryParams: { ...initialParams?.queryParams, memberAddress: address!, status: CampaignStatus.CLAIMED },
    };
    const { data: claimedCampaigns } = useCampaignList(claimedCampaignParams, { enabled: address != null });

    const campaignStatsParams = { urlParams: { memberAddress: address! } };
    const { data: campaignStats } = useCampaignStats(campaignStatsParams, { enabled: address != null });

    // Assuming backend returns sorted by default
    const { claimTimestamp: latestClaimTimestamp } = claimedCampaigns?.pages[0].data[0] ?? {};
    const latestClaimDate = latestClaimTimestamp ? latestClaimTimestamp * 1000 : undefined;

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
            value: claimableCampaignData?.pages[0].metadata.totalRecords ?? '-',
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
            {stats.map(({ label, value, suffix }) => (
                <StatCard key={label} value={value} suffix={suffix} label={label} />
            ))}
        </div>
    );
};

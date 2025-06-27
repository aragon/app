import {
    useCampaignList,
    useCampaignStats,
    CampaignStatus
} from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { DateFormat, formatterUtils, Heading, NumberFormat } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';

export interface ICapitalDistributorRewardsStatsProps {}

export const CapitalDistributorRewardsStats: React.FC<ICapitalDistributorRewardsStatsProps> = () => {
    const { t } = useTranslations();
    const { address } = useAccount();

    const campaignParams = { queryParams: { memberAddress: address! } };
    const { data: campaigns } = useCampaignList(campaignParams, { enabled: address != null });
    const claimableCampaigns = campaigns?.filter((campaign) => campaign.status === CampaignStatus.CLAIMABLE);
    const claimedCampaigns = campaigns?.filter((campaign) => campaign.status === CampaignStatus.CLAIMED);

    const campaignStatsParams = { urlParams: { memberAddress: address! } };
    const { data: campaignStats } = useCampaignStats(campaignStatsParams, {
        enabled: address != null,
    });

    const latestClaimedCampaign = claimedCampaigns?.[0];
    const latestClaimDate = latestClaimedCampaign?.claimTimestamp ? latestClaimedCampaign.claimTimestamp * 1000 : undefined;


    const formattedClaimDate = formatterUtils.formatDate(latestClaimDate, { format: DateFormat.RELATIVE });

    const [claimDateValue, claimDateUnit] = formattedClaimDate?.split(' ') ?? [undefined, undefined];
    const claimDateSuffix = t('app.governance.proposalListStats.recentUnit', { unit: claimDateUnit });

    const formattedTotalClaimed = formatterUtils.formatNumber(campaignStats?.totalClaimed, { format: NumberFormat.FIAT_TOTAL_SHORT})
    const formattedTotalClaimable = formatterUtils.formatNumber(campaignStats?.totalClaimable, { format: NumberFormat.FIAT_TOTAL_SHORT });

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
                <div key={stat.label} className="flex flex-col gap-y-1 rounded-xl bg-neutral-50 p-4">
                    <Heading size="h3">
                        {stat.value}
                        {stat.suffix != null && (
                            <span className="text-xs text-neutral-500 md:text-sm">{stat.suffix}</span>
                        )}
                    </Heading>
                    <p className="text-sm text-neutral-500">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

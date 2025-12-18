import { DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { CampaignStatus, type IGetCampaignListParams, useCampaignList } from '../../api/capitalDistributorService';

export interface ICapitalDistributorRewardsStatsProps {
    /**
     * Initial parameters for the campaign list query.
     */
    initialParams: IGetCampaignListParams;
}

export const CapitalDistributorRewardsStats: React.FC<ICapitalDistributorRewardsStatsProps> = (props) => {
    const { initialParams } = props;

    const { t } = useTranslations();
    const { address } = useAccount();

    const claimableCampaignParams = {
        queryParams: { ...initialParams.queryParams, userAddress: address!, status: CampaignStatus.CLAIMABLE },
    };
    const { data: claimableCampaignData } = useCampaignList(claimableCampaignParams, { enabled: address != null });

    const claimedCampaignParams = {
        queryParams: { ...initialParams.queryParams, userAddress: address!, status: CampaignStatus.CLAIMED },
    };
    const { data: claimedCampaigns } = useCampaignList(claimedCampaignParams, { enabled: address != null });

    const { blockTimestamp: latestClaimTimestamp } = claimedCampaigns?.pages[0].data[0]?.userData.claims[0] ?? {};
    const latestClaimDate = latestClaimTimestamp ? latestClaimTimestamp * 1000 : undefined;

    const formattedClaimDate = formatterUtils.formatDate(latestClaimDate, { format: DateFormat.RELATIVE });

    const [claimDateValue, claimDateUnit] = formattedClaimDate?.split(' ') ?? [undefined, undefined];
    const claimDateSuffix = t('app.governance.proposalListStats.recentUnit', { unit: claimDateUnit });

    const stats = [
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
                <StatCard key={label} label={label} suffix={suffix} value={value} />
            ))}
        </div>
    );
};

import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { DataListContainer, DataListPagination, DataListRoot } from '@aragon/gov-ui-kit';
import { useAccount } from 'wagmi';
import {
    type CampaignStatus,
    type IGetCampaignsListParams,
    useCampaignList,
} from '../../api/capitalDistributorService';
import { CapitalDistributorCampaignListItem } from '../capitalDistributorCampaignListItem';

export interface ICapitalDistributorCampaignListProps {
    /**
     * The status of the campaigns to filter by.
     */
    campaignFilter: CampaignStatus;
    /**
     * The DAO with the capital-distributor plugin installed.
     */
    dao: IDao;
    /**
     * Initial parameters for the campaign list query.
     */
    initialParams?: IGetCampaignsListParams;
}

export const CapitalDistributorCampaignList: React.FC<ICapitalDistributorCampaignListProps> = (props) => {
    const { campaignFilter, dao, initialParams } = props;

    const { address } = useAccount();
    const { t } = useTranslations();

    const campaignParams = {
        queryParams: { ...initialParams?.queryParams, memberAddress: address!, status: campaignFilter },
    };
    const {
        data: campaignData,
        fetchNextPage,
        status,
        fetchStatus,
        isFetchingNextPage,
    } = useCampaignList(campaignParams, { enabled: address != null });

    const state = dataListUtils.queryToDataListState({ status, fetchStatus, isFetchingNextPage });

    const itemsCount = campaignData?.pages[0]?.metadata?.totalRecords;
    const pageSize = campaignData?.pages[0]?.metadata?.pageSize;

    const emptyState = {
        heading: t('app.plugins.capitalDistributor.capitalDistributorCampaignList.emptyState.heading'),
        description: t('app.plugins.capitalDistributor.capitalDistributorCampaignList.emptyState.description'),
    };

    const errorState = {
        heading: t('app.plugins.capitalDistributor.capitalDistributorCampaignList.errorState.heading'),
        description: t('app.plugins.capitalDistributor.capitalDistributorCampaignList.errorState.description'),
    };

    const campaignList = campaignData?.pages.flatMap((page) => page.data);

    return (
        <DataListRoot
            entityLabel={t('app.plugins.capitalDistributor.capitalDistributorCampaignList.entity')}
            onLoadMore={fetchNextPage}
            state={state}
            pageSize={pageSize}
            itemsCount={itemsCount}
        >
            <DataListContainer
                errorState={errorState}
                emptyState={emptyState}
                SkeletonElement={CapitalDistributorCampaignListItem.Skeleton}
            >
                {campaignList?.map((campaign) => (
                    <CapitalDistributorCampaignListItem.Structure key={campaign.id} campaign={campaign} dao={dao} />
                ))}
            </DataListContainer>
            <DataListPagination />
        </DataListRoot>
    );
};

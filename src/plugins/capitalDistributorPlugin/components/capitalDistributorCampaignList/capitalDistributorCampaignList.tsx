import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import { DataListContainer, DataListPagination, DataListRoot, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { CampaignStatus, type IGetCampaignsListParams, useCampaignList } from '../../api/capitalDistributorService';
import { CapitalDistributorCampaignListItem } from '../capitalDistributorCampaignListItem';

export interface ICapitalDistributorCampaignListProps {
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
    const { dao, initialParams } = props;

    const { address } = useAccount();
    const { t } = useTranslations();

    const [campaignFilter, setCampaignFilter] = useState(CampaignStatus.CLAIMABLE);

    const handleToggleChange = (value?: string) => (value ? setCampaignFilter(value as CampaignStatus) : undefined);

    const campaignQueryParams = { ...initialParams?.queryParams, memberAddress: address!, status: campaignFilter };
    const {
        data: campaignData,
        fetchNextPage,
        status,
        fetchStatus,
        isFetchingNextPage,
    } = useCampaignList({ queryParams: campaignQueryParams }, { enabled: address != null });

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
        <div className="flex flex-col gap-3">
            <ToggleGroup
                className="flex gap-3"
                isMultiSelect={false}
                onChange={handleToggleChange}
                value={campaignFilter}
            >
                <Toggle
                    value={CampaignStatus.CLAIMABLE}
                    label={t('app.plugins.capitalDistributor.capitalDistributorCampaignList.filter.claimable')}
                />
                <Toggle
                    value={CampaignStatus.CLAIMED}
                    label={t('app.plugins.capitalDistributor.capitalDistributorCampaignList.filter.claimed')}
                />
            </ToggleGroup>
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
        </div>
    );
};

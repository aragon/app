import {
    DataListContainer,
    DataListPagination,
    DataListRoot,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useConnection } from 'wagmi';
import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import {
    CampaignStatus,
    type IGetCampaignListParams,
    useCampaignList,
} from '../../api/capitalDistributorService';
import { CapitalDistributorCampaignListItemSkeleton } from './capitalDistributorCampaignListItemSkeleton';
import { CapitalDistributorCampaignListItemStructure } from './capitalDistributorCampaignListItemStructure';

export interface ICapitalDistributorCampaignListProps {
    /**
     * The DAO with the capital-distributor plugin installed.
     */
    dao: IDao;
    /**
     * Initial parameters for the campaign list query.
     */
    initialParams: IGetCampaignListParams;
}

export const CapitalDistributorCampaignList: React.FC<
    ICapitalDistributorCampaignListProps
> = (props) => {
    const { dao, initialParams } = props;

    const { address } = useConnection();
    const { t } = useTranslations();

    const [campaignFilter, setCampaignFilter] = useState(
        CampaignStatus.CLAIMABLE,
    );

    const handleToggleChange = (value?: string) =>
        value ? setCampaignFilter(value as CampaignStatus) : undefined;

    const campaignQueryParams = {
        ...initialParams.queryParams,
        userAddress: address!,
        status: campaignFilter,
    };
    const {
        data: campaignData,
        fetchNextPage,
        status,
        fetchStatus,
        isFetchingNextPage,
    } = useCampaignList(
        { queryParams: campaignQueryParams },
        { enabled: address != null },
    );

    const state = dataListUtils.queryToDataListState({
        status,
        fetchStatus,
        isFetchingNextPage,
    });

    const itemsCount = campaignData?.pages[0]?.metadata?.totalRecords;
    const pageSize = campaignData?.pages[0]?.metadata?.pageSize;

    const emptyState = {
        heading: t(
            'app.plugins.capitalDistributor.capitalDistributorCampaignList.emptyState.heading',
        ),
        description: t(
            'app.plugins.capitalDistributor.capitalDistributorCampaignList.emptyState.description',
        ),
    };

    const errorState = {
        heading: t(
            'app.plugins.capitalDistributor.capitalDistributorCampaignList.errorState.heading',
        ),
        description: t(
            'app.plugins.capitalDistributor.capitalDistributorCampaignList.errorState.description',
        ),
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
                    label={t(
                        'app.plugins.capitalDistributor.capitalDistributorCampaignList.filter.claimable',
                    )}
                    value={CampaignStatus.CLAIMABLE}
                />
                <Toggle
                    label={t(
                        'app.plugins.capitalDistributor.capitalDistributorCampaignList.filter.claimed',
                    )}
                    value={CampaignStatus.CLAIMED}
                />
            </ToggleGroup>
            <DataListRoot
                entityLabel={t(
                    'app.plugins.capitalDistributor.capitalDistributorCampaignList.entity',
                )}
                itemsCount={itemsCount}
                onLoadMore={fetchNextPage}
                pageSize={pageSize}
                state={state}
            >
                <DataListContainer
                    emptyState={emptyState}
                    errorState={errorState}
                    SkeletonElement={CapitalDistributorCampaignListItemSkeleton}
                >
                    {campaignList?.map((campaign) => (
                        <CapitalDistributorCampaignListItemStructure
                            campaign={campaign}
                            dao={dao}
                            key={campaign.campaignId}
                        />
                    ))}
                </DataListContainer>
                <DataListPagination />
            </DataListRoot>
        </div>
    );
};

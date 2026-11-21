import {
    DataList,
    type IDataListItemProps,
    StateSkeletonBar,
} from '@aragon/gov-ui-kit';

export type ICapitalDistributorCampaignListItemSkeletonProps =
    IDataListItemProps;

export const CapitalDistributorCampaignListItemSkeleton: React.FC<
    ICapitalDistributorCampaignListItemSkeletonProps
> = () => (
    <DataList.Item
        aria-busy="true"
        aria-label="loading"
        className="flex items-center gap-section-wide--fixed-48 p-inset-surface-wide"
        tabIndex={0}
    >
        <div className="flex grow items-center gap-group">
            <StateSkeletonBar width="10%" />
            <div className="flex flex-col gap-tight">
                <StateSkeletonBar />
                <StateSkeletonBar />
            </div>
        </div>
        <div className="flex items-center gap-group">
            <div className="flex flex-col gap-tight">
                <StateSkeletonBar />
                <StateSkeletonBar />
            </div>
            <div className="flex flex-col gap-tight">
                <StateSkeletonBar />
                <StateSkeletonBar />
            </div>
        </div>
    </DataList.Item>
);

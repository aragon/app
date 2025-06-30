import { DataList, type IDataListItemProps, StateSkeletonBar } from "@aragon/gov-ui-kit"

export type ICapitalDistributorCampaignListItemSkeletonProps = IDataListItemProps

export const CapitalDistributorCampaignListItemSkeleton: React.FC<ICapitalDistributorCampaignListItemSkeletonProps> = () => {
  return (
    <DataList.Item
                tabIndex={0}
            aria-busy="true"
            aria-label="loading"
                className="flex items-center gap-12 p-6"
            >
                <div className="flex grow items-center gap-4">
                    <StateSkeletonBar width='10%' />
                    <div className="flex flex-col gap-1">
                        <StateSkeletonBar />
                        <StateSkeletonBar />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <StateSkeletonBar />
                       <StateSkeletonBar />
                    </div>
                    <div className="flex flex-col gap-1">
                        <StateSkeletonBar />
                        <StateSkeletonBar />
                    </div>
                </div>
            </DataList.Item>
  )
}

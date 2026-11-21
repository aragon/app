'use client';

import { DataList, StateSkeletonBar } from '@aragon/gov-ui-kit';

export const CapitalDistributorCampaignListItemSkeleton: React.FC = () => (
    <DataList.Item
        aria-busy="true"
        aria-label="loading"
        className="flex items-center gap-group px-inset-item py-inset-item--12-24"
        tabIndex={-1}
    >
        <div className="flex min-w-0 flex-1 flex-col gap-related--fixed-8">
            <StateSkeletonBar size="sm" width="25%" />
            <StateSkeletonBar size="lg" width="60%" />
            <StateSkeletonBar size="sm" width="75%" />
        </div>
    </DataList.Item>
);

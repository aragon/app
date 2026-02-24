'use client';

import { DataList, StateSkeletonBar } from '@aragon/gov-ui-kit';

export const CapitalDistributorCampaignListItemSkeleton: React.FC = () => (
    <DataList.Item
        aria-busy="true"
        aria-label="loading"
        className="flex items-center gap-4 px-4 py-3 md:p-6"
        tabIndex={-1}
    >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
            <StateSkeletonBar size="sm" width="25%" />
            <StateSkeletonBar size="lg" width="60%" />
            <StateSkeletonBar size="sm" width="75%" />
        </div>
    </DataList.Item>
);

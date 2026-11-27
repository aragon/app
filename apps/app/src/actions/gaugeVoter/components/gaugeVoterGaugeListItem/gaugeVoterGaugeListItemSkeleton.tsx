'use client';

import {
    DataList,
    StateSkeletonBar,
    StateSkeletonCircular,
} from '@aragon/gov-ui-kit';

export const GaugeVoterGaugeListItemSkeleton: React.FC = () => (
    <DataList.Item
        aria-busy="true"
        aria-label="loading"
        className="flex items-center gap-group px-inset-item py-inset-item--12-24"
        tabIndex={-1}
    >
        <StateSkeletonCircular size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-related--fixed-8">
            <StateSkeletonBar size="lg" width="75%" />
            <StateSkeletonBar size="sm" width="50%" />
        </div>
    </DataList.Item>
);

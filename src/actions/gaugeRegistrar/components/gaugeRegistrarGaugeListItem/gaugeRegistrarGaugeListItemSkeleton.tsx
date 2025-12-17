import { DataList, StateSkeletonBar, StateSkeletonCircular } from '@aragon/gov-ui-kit';

export const GaugeRegistrarGaugeListItemSkeleton = () => (
    <DataList.Item aria-busy="true" aria-label="loading" className="flex items-center gap-4 px-4 py-3 md:p-6" tabIndex={-1}>
        <StateSkeletonCircular size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
            <StateSkeletonBar size="lg" width="75%" />
            <StateSkeletonBar size="sm" width="50%" />
        </div>
    </DataList.Item>
);

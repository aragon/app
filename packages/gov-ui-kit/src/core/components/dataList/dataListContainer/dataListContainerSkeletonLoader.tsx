import { DataListItem } from '../dataListItem';

export interface IDataListContainerSkeletonLoaderProps {}

export const DataListContainerSkeletonLoader: React.FC<IDataListContainerSkeletonLoaderProps> = () => (
    <DataListItem
        aria-busy="true"
        aria-label="loading"
        className="flex animate-pulse flex-col gap-related py-inset-item--16-24"
        tabIndex={0}
    >
        <div className="h-5 w-1/3 rounded-full bg-neutral-50" />
        <div className="flex flex-col gap-tight--fixed-6">
            <div className="h-4 grow rounded-full bg-neutral-50" />
            <div className="h-4 w-1/4 rounded-full bg-neutral-50" />
        </div>
        <div className="flex flex-row gap-tight">
            <div className="h-4 w-1/5 rounded bg-neutral-50" />
            <div className="h-4 w-1/4 rounded bg-neutral-50" />
        </div>
    </DataListItem>
);

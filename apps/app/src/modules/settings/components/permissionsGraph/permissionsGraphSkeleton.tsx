import { StateSkeletonBar } from '@aragon/gov-ui-kit';

export const PermissionsGraphSkeleton: React.FC = () => (
    <div
        className="flex h-[560px] w-full flex-col gap-4 rounded-lg border border-neutral-200 p-6"
        data-testid="permissions-graph-skeleton"
    >
        <StateSkeletonBar width="36%" />
        <StateSkeletonBar width="64%" />
        <StateSkeletonBar width="48%" />
    </div>
);

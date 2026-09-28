import { StateSkeletonBar, StateSkeletonCircular } from '@aragon/gov-ui-kit';
import { PermissionsListHeader } from './permissionsListHeader';

const SKELETON_ROW_KEYS = [
    'skeleton-1',
    'skeleton-2',
    'skeleton-3',
    'skeleton-4',
];

export const PermissionsListSkeleton: React.FC = () => (
    <div
        className="flex flex-col gap-3"
        data-testid="permissions-list-skeleton"
    >
        <PermissionsListHeader />
        {SKELETON_ROW_KEYS.map((rowKey) => (
            <div
                className="flex items-center justify-between gap-x-4 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 md:gap-x-6 md:px-6 md:py-5"
                key={rowKey}
            >
                <div className="grid w-full grid-cols-2 items-center gap-2 md:grid-cols-4 md:gap-4">
                    <StateSkeletonBar width="58%" />
                    <StateSkeletonBar width="50%" />
                    <StateSkeletonBar width="72%" />
                    <StateSkeletonBar width="44%" />
                </div>
                <StateSkeletonCircular className="shrink-0" size="sm" />
            </div>
        ))}
    </div>
);

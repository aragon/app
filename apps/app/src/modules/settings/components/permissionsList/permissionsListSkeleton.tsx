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
        className="flex flex-col gap-related"
        data-testid="permissions-list-skeleton"
    >
        <PermissionsListHeader />
        {SKELETON_ROW_KEYS.map((rowKey) => (
            <div
                className="flex items-center justify-between gap-x-group-stepped rounded-xl border border-neutral-100 bg-neutral-0 px-inset-item py-inset-item"
                key={rowKey}
            >
                <div className="grid w-full grid-cols-2 items-center gap-related--8-16 md:grid-cols-4">
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

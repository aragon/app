'use client';

import { StateSkeletonBar } from '@aragon/gov-ui-kit';

export const AllowedActionsSkeleton: React.FC = () => (
    <div className="flex flex-col gap-3">
        <StateSkeletonBar width="70%" />
        <StateSkeletonBar width="55%" />
        <StateSkeletonBar width="65%" />
    </div>
);

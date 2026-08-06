import { StateSkeletonBar, StateSkeletonCircular } from '@aragon/gov-ui-kit';

const sizes = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

export const Sizes = () => (
    <div className="flex items-end gap-6 rounded-xl bg-neutral-800 p-6">
        {sizes.map((size) => (
            <div className="flex flex-col items-center gap-2" key={size}>
                <StateSkeletonCircular size={size} />
                <span className="text-neutral-300 text-xs">{size}</span>
            </div>
        ))}
    </div>
);

export const MemberRowLoading = () => (
    <div className="flex w-96 flex-col gap-4 rounded-xl border border-neutral-100 bg-neutral-0 p-6">
        {[0, 1, 2].map((row) => (
            <div className="flex items-center gap-3" key={row}>
                <StateSkeletonCircular size="lg" />
                <div className="flex grow flex-col gap-2">
                    <StateSkeletonBar size="md" width="50%" />
                    <StateSkeletonBar size="sm" width="30%" />
                </div>
            </div>
        ))}
    </div>
);

export const DaoAvatarLoading = () => (
    <div className="flex items-center gap-4 rounded-xl bg-neutral-800 p-6">
        <StateSkeletonCircular size="2xl" />
        <div className="flex flex-col gap-2">
            <StateSkeletonBar size="lg" width={180} />
            <StateSkeletonBar size="sm" width={120} />
        </div>
    </div>
);

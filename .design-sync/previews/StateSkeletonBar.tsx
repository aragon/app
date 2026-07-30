import { StateSkeletonBar } from '@aragon/gov-ui-kit';

const sizes = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

export const Sizes = () => (
    <div className="flex w-80 flex-col gap-4 rounded-xl bg-neutral-800 p-6">
        {sizes.map((size) => (
            <div className="flex items-center gap-4" key={size}>
                <span className="w-8 text-neutral-300 text-xs">{size}</span>
                <StateSkeletonBar size={size} width="70%" />
            </div>
        ))}
    </div>
);

export const Widths = () => (
    <div className="flex w-80 flex-col gap-3 rounded-xl bg-neutral-800 p-6">
        <StateSkeletonBar size="md" width="100%" />
        <StateSkeletonBar size="md" width="75%" />
        <StateSkeletonBar size="md" width="50%" />
        <StateSkeletonBar size="md" width={120} />
    </div>
);

export const ProposalCardLoading = () => (
    <div className="flex w-96 flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-6">
        <StateSkeletonBar size="xl" width="65%" />
        <StateSkeletonBar size="md" width="100%" />
        <StateSkeletonBar size="md" width="90%" />
        <div className="flex items-center justify-between pt-2">
            <StateSkeletonBar size="sm" width="30%" />
            <StateSkeletonBar size="sm" width="20%" />
        </div>
    </div>
);

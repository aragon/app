import { DataList } from '@aragon/gov-ui-kit';

export const GaugeVoterGaugeListItemSkeleton: React.FC = () => {
    return (
        <DataList.Item className="flex min-h-20 items-center gap-4 px-6 py-3">
            <div className="flex min-w-0 grow basis-0 items-center gap-4">
                <div className="size-10 shrink-0 animate-pulse rounded-full bg-neutral-200" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
                </div>
            </div>

            <div className="flex grow basis-0 flex-col gap-1 text-right">
                <div className="ml-auto h-6 w-24 animate-pulse rounded bg-neutral-200" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-neutral-200" />
            </div>

            <div className="flex min-h-11 grow basis-0 flex-col items-end">
                <div className="h-6 w-12 animate-pulse rounded bg-neutral-200" />
            </div>

            <div className="flex w-30 items-center justify-end md:w-36">
                <div className="h-8 w-20 animate-pulse rounded bg-neutral-200" />
            </div>
        </DataList.Item>
    );
};

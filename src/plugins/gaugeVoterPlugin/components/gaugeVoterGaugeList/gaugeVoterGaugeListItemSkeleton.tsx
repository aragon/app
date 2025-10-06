import { DataList } from '@aragon/gov-ui-kit';

export const GaugeVoterGaugeListItemSkeleton: React.FC = () => {
    return (
        <DataList.Item className="flex items-center gap-4 min-h-20 px-6 py-3">
            {/* Header - Name and Address */}
            <div className="flex basis-0 grow items-center gap-4 min-w-0">
                <div className="size-10 shrink-0 animate-pulse rounded-full bg-neutral-200" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
                </div>
            </div>

            {/* Total Votes */}
            <div className="flex basis-0 grow flex-col gap-1 text-right">
                <div className="ml-auto h-6 w-24 animate-pulse rounded bg-neutral-200" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-neutral-200" />
            </div>

            {/* User Votes */}
            <div className="flex basis-0 grow flex-col items-end min-h-11">
                <div className="h-6 w-12 animate-pulse rounded bg-neutral-200" />
            </div>

            {/* Actions */}
            <div className="flex w-36 items-center justify-end pl-8">
                <div className="h-8 w-20 animate-pulse rounded bg-neutral-200" />
            </div>
        </DataList.Item>
    );
};
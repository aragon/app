import { DataList } from '@aragon/gov-ui-kit';

export const GaugeVoterGaugeListItemSkeleton: React.FC = () => {
    return (
        <DataList.Item className="flex flex-col gap-3 px-4 py-3 md:min-h-20 md:flex-row md:items-center md:gap-4 md:px-6">
            {/* Top section on mobile - Gauge info with border bottom */}
            <div className="flex min-w-0 grow items-center gap-3 border-neutral-100 border-b pb-3 md:basis-0 md:gap-4 md:border-b-0 md:pb-0">
                <div className="size-8 shrink-0 animate-pulse rounded-full bg-neutral-200 md:size-10" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200 md:h-6" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200" />
                </div>
            </div>

            {/* Middle section on mobile - Total votes and Your votes side by side */}
            <div className="flex items-start justify-between gap-4 md:contents">
                {/* Total votes column */}
                <div className="flex flex-col gap-1 md:grow md:basis-0 md:text-right">
                    {/* Mobile-only label */}
                    <div className="h-3 w-20 animate-pulse rounded bg-neutral-200 md:hidden" />
                    <div className="h-5 w-24 animate-pulse rounded bg-neutral-200 md:ml-auto md:h-6" />
                    <div className="h-4 w-16 animate-pulse rounded bg-neutral-200 md:ml-auto" />
                </div>

                {/* Your votes column */}
                <div className="flex flex-col gap-1 text-right md:grow md:basis-0">
                    {/* Mobile-only label */}
                    <div className="ml-auto h-3 w-20 animate-pulse rounded bg-neutral-200 md:hidden" />
                    <div className="flex min-h-11 flex-col items-end md:justify-center">
                        <div className="h-5 w-16 animate-pulse rounded bg-neutral-200 md:h-6" />
                    </div>
                </div>
            </div>

            {/* Button section - full width on mobile */}
            <div className="flex w-full items-center justify-end md:w-36">
                <div className="h-8 w-full animate-pulse rounded bg-neutral-200 md:w-20" />
            </div>
        </DataList.Item>
    );
};

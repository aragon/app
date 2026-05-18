import classNames from 'classnames';

/**
 * Loading skeletons for the Flow pages. Shapes mirror the real layouts so
 * there's minimal CLS / visual jump when the Envio snapshot resolves and
 * replaces the placeholder.
 *
 * Primitives (`Bar`, `Card`) are kept local — Flow is the only surface that
 * needs them and they're too trivial to justify a shared component.
 */

interface IBarProps {
    className?: string;
}

const Bar: React.FC<IBarProps> = ({ className }) => (
    <div
        className={classNames(
            'animate-pulse rounded-md bg-neutral-100',
            className,
        )}
    />
);

const Card: React.FC<{
    className?: string;
    children?: React.ReactNode;
}> = ({ className, children }) => (
    <div
        className={classNames(
            'flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-4 shadow-neutral-sm',
            className,
        )}
    >
        {children}
    </div>
);

const LedeSkeleton: React.FC = () => (
    <div className="flex flex-col gap-2">
        <Bar className="h-7 w-64 md:h-8" />
        <Bar className="h-5 w-full max-w-xl" />
    </div>
);

const KpiRowSkeleton: React.FC = () => (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={`kpi-${idx}`}>
                <Bar className="h-4 w-24" />
                <Bar className="h-7 w-20 md:h-8" />
                <Bar className="h-3 w-28" />
            </Card>
        ))}
    </div>
);

const PolicyCardSkeleton: React.FC = () => (
    <Card className="gap-4">
        <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-2">
                <Bar className="h-5 w-40" />
                <Bar className="h-3 w-24" />
            </div>
            <Bar className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
            <Bar className="h-10" />
            <Bar className="h-10" />
        </div>
        <Bar className="h-16" />
        <div className="flex items-center justify-between gap-2">
            <Bar className="h-4 w-24" />
            <Bar className="h-8 w-24 rounded-full" />
        </div>
    </Card>
);

const PoliciesSectionSkeleton: React.FC = () => (
    <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <Bar className="h-5 w-20" />
                <Bar className="h-7 w-16 rounded-full" />
                <Bar className="h-7 w-28 rounded-full" />
            </div>
            <Bar className="h-8 w-36 rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
                <PolicyCardSkeleton key={`policy-${idx}`} />
            ))}
        </div>
    </section>
);

const ActivityFeedSkeleton: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
    <section className="flex flex-col gap-3">
        <Bar className="h-5 w-24" />
        <Card className="gap-0 p-0">
            {Array.from({ length: rows }).map((_, idx) => (
                <div
                    className={classNames(
                        'flex items-center gap-3 px-4 py-3',
                        idx !== rows - 1 && 'border-neutral-100 border-b',
                    )}
                    key={`activity-${idx}`}
                >
                    <Bar className="size-8 shrink-0 rounded-full" />
                    <div className="flex flex-1 flex-col gap-2">
                        <Bar className="h-4 w-3/4 max-w-sm" />
                        <Bar className="h-3 w-1/2 max-w-xs" />
                    </div>
                    <Bar className="hidden h-4 w-20 md:block" />
                </div>
            ))}
        </Card>
    </section>
);

const RecipientsTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <Card className="gap-0 p-0">
        <div className="flex items-center gap-3 border-neutral-100 border-b px-4 py-3">
            <Bar className="h-4 w-40" />
            <Bar className="ml-auto h-4 w-24" />
            <Bar className="h-4 w-24" />
        </div>
        {Array.from({ length: rows }).map((_, idx) => (
            <div
                className={classNames(
                    'flex items-center gap-3 px-4 py-3',
                    idx !== rows - 1 && 'border-neutral-100 border-b',
                )}
                key={`recipient-${idx}`}
            >
                <Bar className="size-8 shrink-0 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                    <Bar className="h-4 w-48 max-w-full" />
                    <Bar className="h-3 w-32 max-w-full" />
                </div>
                <Bar className="hidden h-4 w-24 md:block" />
                <Bar className="hidden h-4 w-20 md:block" />
            </div>
        ))}
    </Card>
);

export const FlowOverviewPageSkeleton: React.FC = () => (
    <div className="flex flex-col gap-8">
        <LedeSkeleton />
        <KpiRowSkeleton />
        <PoliciesSectionSkeleton />
        <ActivityFeedSkeleton />
    </div>
);

export const FlowActivityPageSkeleton: React.FC = () => (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
            <Bar className="h-7 w-40 md:h-8" />
            <Bar className="h-5 w-80 max-w-full" />
        </div>
        <ActivityFeedSkeleton rows={8} />
    </div>
);

export const FlowRecipientsPageSkeleton: React.FC = () => (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
            <Bar className="h-7 w-48 md:h-8" />
            <Bar className="h-5 w-96 max-w-full" />
        </div>
        <RecipientsTableSkeleton rows={6} />
    </div>
);

/**
 * Generic error banner shown on any Flow page when the Envio indexer query
 * fails and we don't yet have a cached snapshot to fall back to.
 */
export const FlowLoadError: React.FC<{ message?: string }> = ({ message }) => (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-critical-200 bg-critical-50 p-6">
        <h2 className="font-semibold text-critical-800 text-lg leading-tight">
            Couldn’t load Flow data
        </h2>
        <p className="font-normal text-critical-700 text-sm leading-relaxed">
            {message ??
                'The capital flow indexer is unreachable. Refresh in a moment; if the problem persists, check the indexer status.'}
        </p>
    </div>
);

export const FlowPolicyDetailPageSkeleton: React.FC = () => (
    <div className="flex flex-col gap-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-center gap-3">
                    <Bar className="h-8 w-56 md:h-9 md:w-72" />
                    <Bar className="h-6 w-20 rounded-full" />
                    <Bar className="h-6 w-16 rounded-full" />
                </div>
                <Bar className="h-4 w-full max-w-2xl" />
                <div className="flex flex-wrap items-center gap-2">
                    <Bar className="h-6 w-24 rounded-full" />
                    <Bar className="h-6 w-32 rounded-full" />
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
                <Bar className="h-10 w-48 rounded-full" />
                <Bar className="h-3 w-40" />
            </div>
        </header>
        <Card className="h-64" />
        <Card className="h-40" />
        <RecipientsTableSkeleton rows={4} />
        <Card className="h-48" />
    </div>
);

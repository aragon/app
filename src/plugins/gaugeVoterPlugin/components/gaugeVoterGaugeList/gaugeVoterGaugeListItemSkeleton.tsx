export const GaugeVoterGaugeListItemSkeleton: React.FC = () => {
    return (
        <div className="border border-neutral-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2" />
                    <div className="h-3 bg-neutral-200 rounded w-1/3" />
                </div>
                <div className="h-10 w-20 bg-neutral-200 rounded" />
            </div>
        </div>
    );
};
import type { IGauge } from '../../api/gaugeVoterService/domain';

export interface IGaugeVoterGaugeListProps {
    /**
     * List of gauges to display.
     */
    gauges: IGauge[];
    /**
     * Whether the list is loading.
     */
    isLoading?: boolean;
    /**
     * Function to handle gauge voting.
     */
    onVote?: (gauge: IGauge) => void;
}

export const GaugeVoterGaugeList: React.FC<IGaugeVoterGaugeListProps> = (props) => {
    const { gauges, isLoading, onVote } = props;

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-20 bg-neutral-100 rounded animate-pulse" />
                ))}
            </div>
        );
    }

    if (gauges.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-neutral-500">No gauges available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {gauges.map((gauge) => (
                <div
                    key={gauge.address}
                    className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-lg">{gauge.name}</h3>
                            {gauge.description && (
                                <p className="text-neutral-600 mt-1">{gauge.description}</p>
                            )}
                            <p className="text-sm text-neutral-500 mt-2">
                                Total Votes: {gauge.totalVotes}
                            </p>
                        </div>
                        {onVote && (
                            <button
                                onClick={() => onVote(gauge)}
                                className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                            >
                                Vote
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};
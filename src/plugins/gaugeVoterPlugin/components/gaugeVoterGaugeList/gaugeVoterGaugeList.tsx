import type { IGauge } from '../../api/gaugeVoterService/domain';
import { GaugeVoterGaugeListItemStructure } from './gaugeVoterGaugeListItemStructure';

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
                    <div key={index} className="h-20 animate-pulse rounded bg-neutral-100" />
                ))}
            </div>
        );
    }

    if (gauges.length === 0) {
        return (
            <div className="py-8 text-center">
                <p className="text-neutral-500">No gauges available</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {gauges.map((gauge) => (
                <GaugeVoterGaugeListItemStructure
                    key={gauge.address}
                    gauge={gauge}
                    onVote={onVote}
                    totalEpochVotes={100000000}
                />
            ))}
        </div>
    );
};

import type { IGauge } from '../../api/gaugeVoterService/domain';

export interface IGaugeVoterGaugeListItemStructureProps {
    /**
     * Gauge data to display.
     */
    gauge: IGauge;
    /**
     * Function to handle gauge voting.
     */
    onVote?: (gauge: IGauge) => void;
}

export const GaugeVoterGaugeListItemStructure: React.FC<IGaugeVoterGaugeListItemStructureProps> = (props) => {
    const { gauge, onVote } = props;

    return (
        <div className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-lg">{gauge.name}</h3>
                    {gauge.description && (
                        <p className="text-neutral-600 mt-1">{gauge.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-neutral-500">
                        <span>Total Votes: {gauge.totalVotes}</span>
                        <span>Your Votes: {gauge.userVotes}</span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-400">
                        Address: <span className="font-mono">{gauge.address}</span>
                    </div>
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
    );
};
export interface IGaugeVoterVotingStatsProps {
    /**
     * Total voting power available to the user.
     */
    totalVotingPower: string;
    /**
     * Total voting power already allocated by the user.
     */
    allocatedVotingPower: string;
    /**
     * Number of active gauges the user is voting for.
     */
    activeVotes: number;
}

export const GaugeVoterVotingStats: React.FC<IGaugeVoterVotingStatsProps> = (props) => {
    const { totalVotingPower, allocatedVotingPower, activeVotes } = props;

    const remainingVotingPower = (parseFloat(totalVotingPower) - parseFloat(allocatedVotingPower)).toString();

    return (
        <div className="rounded-lg bg-neutral-50 p-6">
            <h2 className="mb-4 text-xl font-semibold">Your Voting Statistics</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="text-center">
                    <div className="text-primary-600 text-2xl font-bold">{totalVotingPower}</div>
                    <div className="text-sm text-neutral-600">Total Voting Power</div>
                </div>
                <div className="text-center">
                    <div className="text-secondary-600 text-2xl font-bold">{allocatedVotingPower}</div>
                    <div className="text-sm text-neutral-600">Allocated Power</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{remainingVotingPower}</div>
                    <div className="text-sm text-neutral-600">Remaining Power</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{activeVotes}</div>
                    <div className="text-sm text-neutral-600">Active Votes</div>
                </div>
            </div>
        </div>
    );
};

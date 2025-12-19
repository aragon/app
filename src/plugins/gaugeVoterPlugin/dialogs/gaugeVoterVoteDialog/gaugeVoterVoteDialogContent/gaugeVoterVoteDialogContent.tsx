import type { IGauge } from '../../../api/gaugeVoterService/domain';
import { GaugeVoterVoteDialogItem } from '../gaugeVoterVoteDialogItem';

export interface IGaugeVoteAllocation {
    /**
     * Gauge to allocate votes.
     */
    gauge: IGauge;
    /**
     * Percentage value (0-100) to allocate.
     */
    percentage: number;
    /**
     * Votes previously applied.
     */
    existingVotes: bigint;
    /**
     * Votes previously applied, formatted.
     */
    formattedExistingVotes: string;
}

export interface IGaugeVoterVoteDialogContentProps {
    /**
     * The vote allocations to display.
     */
    voteAllocations: IGaugeVoteAllocation[];
    /**
     * Total voting power available to the user.
     */
    totalVotingPower: number;
    /**
     * Token symbol for display.
     */
    tokenSymbol?: string;
    /**
     * Whether the user has modified allocations.
     */
    hasModified: boolean;
    /**
     * Handler for updating vote percentage.
     */
    onUpdatePercentage: (gaugeAddress: string, newPercentage: number) => void;
    /**
     * Handler for removing a gauge.
     */
    onRemoveGauge: (gaugeAddress: string) => void;
}

export const GaugeVoterVoteDialogContent: React.FC<
    IGaugeVoterVoteDialogContentProps
> = (props) => {
    const {
        voteAllocations,
        totalVotingPower,
        tokenSymbol,
        hasModified,
        onUpdatePercentage,
        onRemoveGauge,
    } = props;

    return (
        <div className="flex flex-col gap-4">
            {voteAllocations.map((allocation) => (
                <GaugeVoterVoteDialogItem
                    existingVotes={allocation.existingVotes}
                    formattedExistingVotes={allocation.formattedExistingVotes}
                    gaugeAddress={allocation.gauge.address}
                    gaugeAvatar={allocation.gauge.avatar}
                    gaugeName={allocation.gauge.name}
                    hasModified={hasModified}
                    key={allocation.gauge.address}
                    onRemove={onRemoveGauge}
                    onUpdatePercentage={onUpdatePercentage}
                    percentage={allocation.percentage}
                    tokenSymbol={tokenSymbol}
                    totalVotingPower={totalVotingPower}
                />
            ))}
        </div>
    );
};

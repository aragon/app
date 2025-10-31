import type { IGaugeReturn } from '../../../api/gaugeVoterService/domain';
import { GaugeVoterVoteDialogItem } from '../gaugeVoterVoteDialogItem';

export interface IGaugeVoteAllocation {
    gauge: IGaugeReturn;
    percentage: number;
    existingVotes: bigint;
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

export const GaugeVoterVoteDialogContent: React.FC<IGaugeVoterVoteDialogContentProps> = (props) => {
    const { voteAllocations, totalVotingPower, tokenSymbol, hasModified, onUpdatePercentage, onRemoveGauge } = props;

    return (
        <div className="flex flex-col gap-4">
            {voteAllocations.map((allocation) => (
                <GaugeVoterVoteDialogItem
                    key={allocation.gauge.address}
                    gaugeAddress={allocation.gauge.address}
                    gaugeName={allocation.gauge.name}
                    gaugeAvatar={allocation.gauge.avatar}
                    percentage={allocation.percentage}
                    existingVotes={allocation.existingVotes}
                    formattedExistingVotes={allocation.formattedExistingVotes}
                    totalVotingPower={totalVotingPower}
                    tokenSymbol={tokenSymbol}
                    hasModified={hasModified}
                    onUpdatePercentage={onUpdatePercentage}
                    onRemove={onRemoveGauge}
                />
            ))}
        </div>
    );
};

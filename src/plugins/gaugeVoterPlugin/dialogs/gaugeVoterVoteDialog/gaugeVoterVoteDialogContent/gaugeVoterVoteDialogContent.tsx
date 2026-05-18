import type { IGauge } from '../../../api/gaugeVoterService/domain';
import { GaugeVoterVoteDialogItem } from '../gaugeVoterVoteDialogItem';

export interface IGaugeVoteAllocation {
    /**
     * Gauge to allocate votes.
     */
    gauge: IGauge;
    /**
     * Relative weight allocated to this gauge (scaled by 10^WEIGHT_PRECISION). The contract
     * normalizes weights against the sum, so absolute magnitudes are irrelevant — only the
     * ratio between gauges matters.
     */
    weight: bigint;
}

export interface IGaugeVoterVoteDialogContentProps {
    /**
     * The vote allocations to display.
     */
    voteAllocations: IGaugeVoteAllocation[];
    /**
     * Sum of all weights — used to compute per-row share display.
     */
    totalWeight: bigint;
    /**
     * Total voting power available to the user.
     */
    totalVotingPower: number;
    /**
     * Token symbol for display.
     */
    tokenSymbol?: string;
    /**
     * Handler for updating vote weight.
     */
    onUpdateWeight: (gaugeAddress: string, weight: bigint) => void;
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
        totalWeight,
        totalVotingPower,
        tokenSymbol,
        onUpdateWeight,
        onRemoveGauge,
    } = props;

    return (
        <div className="flex flex-col gap-4">
            {voteAllocations.map((allocation) => (
                <GaugeVoterVoteDialogItem
                    gaugeAddress={allocation.gauge.address}
                    gaugeAvatar={allocation.gauge.avatar}
                    gaugeName={allocation.gauge.name}
                    key={allocation.gauge.address}
                    onRemove={onRemoveGauge}
                    onUpdateWeight={onUpdateWeight}
                    tokenSymbol={tokenSymbol}
                    totalVotingPower={totalVotingPower}
                    totalWeight={totalWeight}
                    weight={allocation.weight}
                />
            ))}
        </div>
    );
};

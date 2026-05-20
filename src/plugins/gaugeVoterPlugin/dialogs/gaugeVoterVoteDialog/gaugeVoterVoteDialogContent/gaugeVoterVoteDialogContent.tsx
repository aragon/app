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

const SHARE_DECIMALS = 2;
const SHARE_TOTAL_QUANTA = BigInt(10 ** (SHARE_DECIMALS + 2));

const computeHamiltonShares = (weights: bigint[]): number[] => {
    const totalWeight = weights.reduce((sum, w) => sum + w, BigInt(0));
    if (totalWeight === BigInt(0)) {
        return weights.map(() => 0);
    }

    const scaled = weights.map((w) => w * SHARE_TOTAL_QUANTA);
    const floors = scaled.map((sw) => sw / totalWeight);
    const remainders = scaled.map((sw) => sw % totalWeight);

    const sumFloors = floors.reduce((s, f) => s + f, BigInt(0));
    const leftover = Number(SHARE_TOTAL_QUANTA - sumFloors);

    const ranked = remainders
        .map((r, i) => ({ r, i }))
        .sort((a, b) => {
            if (a.r > b.r) {
                return -1;
            }
            if (a.r < b.r) {
                return 1;
            }
            return 0;
        });

    const adjusted = [...floors];
    for (let k = 0; k < leftover; k++) {
        adjusted[ranked[k].i] += BigInt(1);
    }

    return adjusted.map((q) => Number(q) / 10 ** SHARE_DECIMALS);
};

export const GaugeVoterVoteDialogContent: React.FC<
    IGaugeVoterVoteDialogContentProps
> = (props) => {
    const {
        voteAllocations,
        totalVotingPower,
        tokenSymbol,
        onUpdateWeight,
        onRemoveGauge,
    } = props;

    const displayShares = computeHamiltonShares(
        voteAllocations.map((a) => a.weight),
    );
    const anyWeightSet = displayShares.some((s) => s > 0);

    return (
        <div className="flex flex-col gap-4">
            {voteAllocations.map((allocation, index) => (
                <GaugeVoterVoteDialogItem
                    displayShare={anyWeightSet ? displayShares[index] : null}
                    gaugeAddress={allocation.gauge.address}
                    gaugeAvatar={allocation.gauge.avatar}
                    gaugeName={allocation.gauge.name}
                    key={allocation.gauge.address}
                    onRemove={onRemoveGauge}
                    onUpdateWeight={onUpdateWeight}
                    tokenSymbol={tokenSymbol}
                    totalVotingPower={totalVotingPower}
                    weight={allocation.weight}
                />
            ))}
        </div>
    );
};

import { crossChainControllerGas } from '../../constants/crossChainControllerGas';

export interface IResolveGasLimitParams {
    /**
     * Gas the backend measured the delivery to consume, including the controller's reserve. Carries
     * no safety margin and is not checked against the lane cap - the backend deliberately never
     * reads it, so the client owns that check entirely.
     */
    requiredGas: bigint;
}

export interface IResolveGasLimitResult {
    /**
     * Gas limit to submit with the action. Not a usable value when `exceedsMaxGasLimit` is true.
     */
    gasLimit: bigint;
    /**
     * Whether the full margin did not fit under the cap and the limit was clamped to it. The limit
     * still covers the measured requirement, but with less headroom than intended.
     */
    isMarginReduced: boolean;
    /**
     * Whether the measured requirement itself, before any margin, is already above the cap. No
     * choice of margin fixes this - the batch has to be split across several forward actions.
     */
    exceedsMaxGasLimit: boolean;
}

class CrossChainControllerGasUtils {
    /**
     * Adds a safety margin to a gas figure, rounding up.
     * @param gas - The gas to add the margin to.
     * @param bufferPercent - The margin to add, in percent.
     * @returns The gas including the margin.
     */
    applyBuffer = (gas: bigint, bufferPercent: number): bigint => {
        const hundred = BigInt(100);
        const scaled = gas * BigInt(100 + bufferPercent);

        // Round up so the margin is never eroded by integer division.
        return (scaled + hundred - BigInt(1)) / hundred;
    };

    /**
     * Turns the backend's measurement into the limit to submit, applying the safety margin, the
     * floor and the cap.
     * @param params - The measurement.
     * @returns The gas limit to submit, whether its margin was cut short, and whether the
     * requirement alone already exceeds the cap (in which case `gasLimit` is not usable).
     */
    resolveGasLimit = (
        params: IResolveGasLimitParams,
    ): IResolveGasLimitResult => {
        const { requiredGas } = params;
        const { bufferPercent, minGasLimit, maxGasLimit } =
            crossChainControllerGas;
        const cap = BigInt(maxGasLimit);

        if (requiredGas > cap) {
            return {
                gasLimit: cap,
                isMarginReduced: true,
                exceedsMaxGasLimit: true,
            };
        }

        const buffered = this.applyBuffer(requiredGas, bufferPercent);
        const withFloor =
            buffered < BigInt(minGasLimit) ? BigInt(minGasLimit) : buffered;

        if (withFloor > cap) {
            return {
                gasLimit: cap,
                isMarginReduced: true,
                exceedsMaxGasLimit: false,
            };
        }

        return {
            gasLimit: withFloor,
            isMarginReduced: false,
            exceedsMaxGasLimit: false,
        };
    };
}

export const crossChainControllerGasUtils = new CrossChainControllerGasUtils();

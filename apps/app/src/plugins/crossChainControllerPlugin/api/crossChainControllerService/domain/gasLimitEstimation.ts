export enum GasLimitEstimationStatus {
    /**
     * The simulated delivery executed the actions on the destination chain.
     */
    SUCCESS = 'success',
    /**
     * The actions were reached but reverted, so no gas figure could be measured.
     */
    REVERTED = 'reverted',
}

export interface IGasLimitEstimation {
    /**
     * Outcome of the simulation. Only `success` carries a usable `requiredGas`.
     */
    status: GasLimitEstimationStatus;
    /**
     * Gas the delivery consumed in simulation, including the reserve the controller withholds from
     * the payload, as a decimal string. Set only when `status` is `success`.
     *
     * This is a measurement, not a recommendation: it carries no safety margin and is not checked
     * against the lane's per-message gas cap. Applying a margin and deciding whether it fits are
     * the client's, via `crossChainControllerGasUtils`.
     */
    requiredGas?: string;
    /**
     * Decoded revert reason of the failing action. Set when `status` is `reverted`.
     */
    revertReason?: string;
    /**
     * Zero-based index of the action that reverted, when the backend can attribute it.
     */
    revertedActionIndex?: number;
    /**
     * URL of the saved Tenderly simulation, for the user to inspect the trace.
     */
    simulationUrl?: string;
    /**
     * Timestamp of the simulation, in milliseconds.
     */
    runAt: number;
}

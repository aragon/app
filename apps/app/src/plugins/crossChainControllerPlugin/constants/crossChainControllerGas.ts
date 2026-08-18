/**
 * Client-side policy for the `_gasLimit` carried by `forwardMessage`.
 *
 */
export const crossChainControllerGas = {
    /**
     * Safety margin added to the measured requirement, in percent.
     *
     * Chainlink suggests around 10% for an ordinary receiver. This is deliberately far higher:
     *
     * - The payload is arbitrary, user-composed actions rather than a fixed receiver.
     * - The limit is frozen into the proposal calldata at creation time and only spent when the
     *   proposal executes, which can be weeks later, against destination state that has moved.
     * - The EVM withholds 1/64 of the remaining gas at every nested call, and the delivery is five
     *   frames deep (`ccipReceive` -> `receiveMessage` -> `executeActions` -> `Executor.execute` ->
     *   the action itself).
     *
     * Above all, the failure modes are asymmetric. A limit that is *slightly* short records the
     * message as delivered without running its actions, recoverable only through a permissioned
     * retry on the destination chain. A limit that is far too short simply reverts the delivery and
     * stays re-executable by anyone. Overpaying is the cheap mistake; do not lower this without
     * measurements.
     */
    bufferPercent: 30,
    /**
     * Floor applied to the final limit, equal to the CCIP default. Anything lower cannot cover the
     * adapter and controller preamble, let alone any action.
     */
    minGasLimit: 200_000,
    /**
     * Ceiling applied to the submitted gas limit.
     *
     * The backend deliberately never reads or reports the lane's real `maxPerMsgGasLimit` -
     * checking the cap is left entirely to the client. CCIP rejects a message above the lane cap
     * when `ccipSend` runs, which on the origin chain means the proposal passes and then fails to
     * execute. The cap is per-lane source-side config; 3,000,000 is the common value and is used
     * here as a conservative, hardcoded stand-in.
     */
    maxGasLimit: 3_000_000,
} as const;

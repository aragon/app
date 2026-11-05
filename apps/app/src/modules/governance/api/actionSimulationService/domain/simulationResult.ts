export interface ISimulationResult {
    /**
     * Timestamp when the simulation was run.
     */
    runAt: number;
    /**
     * Status of the simulation.
     */
    status: 'success' | 'failed';
    /**
     * URL to view the simulation in Tenderly.
     */
    url: string;
    /**
     * Whether the saved run matches the current actions. Set on proposal GET only.
     */
    matchesCurrentActions?: boolean;
}

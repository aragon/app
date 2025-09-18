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
}

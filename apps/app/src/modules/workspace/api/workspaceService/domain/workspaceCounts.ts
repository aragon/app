export interface IWorkspaceCounts {
    /**
     * Number of contracts tracked by the workspace.
     */
    targets: number;
    /**
     * Number of permission gates found across all targets.
     */
    gates: number;
    /**
     * Number of distinct accounts holding a gate.
     */
    accounts: number;
    /**
     * Number of function selectors gated across all targets.
     */
    capabilities: number;
}

export interface IProposalAuditFinding {
    /**
     * Severity of the finding.
     */
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical' | string;
    /**
     * Category of the finding (e.g. fundDrain, descriptionMismatch).
     */
    category: string;
    /**
     * Human-readable description of the finding.
     */
    description: string;
    /**
     * 0-based index into rawActions when the finding ties to a specific action.
     */
    actionIndex?: number | null;
}

export interface IProposalAudit {
    /**
     * Overall risk level reported by the auditor.
     */
    riskLevel: 'low' | 'medium' | 'high' | 'critical' | string;
    /**
     * Plain-language summary of what the proposal does.
     */
    summary: string;
    /**
     * Per-finding details surfaced by the auditor.
     */
    findings: IProposalAuditFinding[];
    /**
     * Recommendations the auditor suggests for the reviewer.
     */
    recommendations: string[];
    /**
     * Version of the audit prompt that produced the result.
     */
    promptVersion: string;
    /**
     * Tenderly shareable simulation URL when available.
     */
    tenderlyUrl: string | null;
    /**
     * Estimated audit cost in USD when the configured model rates are known.
     */
    costUsd: number | null;
    /**
     * End-to-end audit duration in milliseconds (Mongo lookup → SDK → parse).
     */
    durationMs: number | null;
    /**
     * Unix epoch (ms) when the audit was produced.
     */
    createdAt: number;
}

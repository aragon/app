export type ProposalAnalysisSeverity = 'routine' | 'review' | 'high';

export type ProposalAnalysisIntentVerdict =
    | 'aligned'
    | 'partial'
    | 'contradicted';

export interface IProposalAnalysisTransfer {
    /**
     * Address of the transferred token, zero address for the native token.
     */
    tokenAddress: string;
    /**
     * Token symbol when known.
     */
    symbol: string | null;
    /**
     * Amount normalised by the token decimals, as a decimal string; null when decimals are unknown.
     */
    amount: string | null;
    /**
     * USD value when the token has a price.
     */
    amountUsd: number | null;
    /**
     * Share of the DAO treasury (0..1) when the TVL is known.
     */
    shareOfTreasury: number | null;
    /**
     * Recipient address.
     */
    recipient: string;
}

export interface IProposalAnalysisAction {
    /**
     * Position in the flat action list; report `actionRefs` point here.
     */
    index: number;
    /**
     * Index of the action this one is nested in (execute / createProposal / forwardMessage).
     */
    parentIndex: number | null;
    /**
     * Nesting depth, 0 for top-level actions.
     */
    depth: number;
    /**
     * Decoded action type as stored on the proposal.
     */
    type: string;
    /**
     * Target contract address.
     */
    to: string;
    /**
     * Resolved name of the target contract when known.
     */
    targetName: string | null;
    /**
     * Called function name when known.
     */
    functionName: string | null;
    /**
     * Whether the decoder produced input data for the action.
     */
    decoded: boolean;
    /**
     * Treasury movement produced by the action, if any.
     */
    transfer: IProposalAnalysisTransfer | null;
}

export interface IProposalAnalysisFinding {
    /**
     * Rule that fired.
     */
    flag: string;
    /**
     * Severity the rule contributes.
     */
    severity: ProposalAnalysisSeverity;
    /**
     * Actions the rule fired on.
     */
    actionRefs: number[];
    /**
     * Small context for rendering (function name, share, counts).
     */
    detail?: Record<string, string | number>;
}

export interface IProposalAnalysisReportItem {
    /**
     * Sentence written by the model.
     */
    text: string;
    /**
     * Indices of the fact-pack actions the sentence is about.
     */
    actionRefs: number[];
}

export interface IProposalAnalysisReport {
    /**
     * One-sentence substance of the proposal.
     */
    headline: string;
    /**
     * Effects in execution order, each pointing at the actions producing it.
     */
    whatItDoes: IProposalAnalysisReportItem[];
    /**
     * Comparison of the author's text with the decoded actions.
     */
    intentMismatch: {
        verdict: ProposalAnalysisIntentVerdict;
        explanation: string;
        actionRefs: number[];
    };
    /**
     * What changes for the DAO if the proposal executes.
     */
    whyItMatters: string;
    /**
     * Questions a voter should ask the author before voting.
     */
    openQuestions: string[];
    /**
     * Final severity, never below the rules' floor.
     */
    severity: ProposalAnalysisSeverity;
}

export interface IProposalAnalysis {
    /**
     * ID of the analysed proposal.
     */
    proposalId: string;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Final severity, max(rules, model).
     */
    severity: ProposalAnalysisSeverity;
    /**
     * Severity floor computed by the deterministic rules.
     */
    rulesSeverity: ProposalAnalysisSeverity;
    /**
     * The written report.
     */
    report: IProposalAnalysisReport;
    /**
     * Rules that fired.
     */
    findings: IProposalAnalysisFinding[];
    /**
     * Facts the report refers to; only the parts the card renders are typed here.
     */
    factPack: {
        actions: IProposalAnalysisAction[];
        treasury: {
            tvlUsd: number | null;
            outflowUsd: number | null;
            outflowShare: number | null;
        };
    };
    /**
     * Model that wrote the report.
     */
    model: string;
    /**
     * Version of the prompt the report was written with.
     */
    promptVersion: string;
    /**
     * Generation time in unix milliseconds.
     */
    generatedAt: number;
}

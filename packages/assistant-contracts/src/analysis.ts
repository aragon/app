import { z } from 'zod';

// Wire contract of the proposal-analysis endpoint (POST /analysis/proposal). The caller is the
// Aragon backend, which lives in another repository and mirrors these shapes by hand
// (`src/types/proposalAnalysis.ts` there). `proposalAnalysisContractVersion` travels in every
// request so a drift between the two copies surfaces as an explicit 400 instead of a confusing
// validation error. Bump it together with the backend whenever a shape below changes.
export const proposalAnalysisContractVersion = 1;

export const proposalAnalysisSeveritySchema = z.enum([
    'routine',
    'review',
    'high',
]);

export type IProposalAnalysisSeverity = z.infer<
    typeof proposalAnalysisSeveritySchema
>;

// Rank used by max(rules, model): the model may raise the rules' floor, never lower it.
export const proposalAnalysisSeverityRank: Record<
    IProposalAnalysisSeverity,
    number
> = { routine: 0, review: 1, high: 2 };

export const proposalAnalysisIntentVerdictSchema = z.enum([
    'aligned',
    'partial',
    'contradicted',
]);

export type IProposalAnalysisIntentVerdict = z.infer<
    typeof proposalAnalysisIntentVerdictSchema
>;

export const proposalAnalysisTargetKindSchema = z.enum([
    'dao',
    'plugin',
    'contract',
    'wallet',
    'unknown',
]);

export const proposalAnalysisFlagSchema = z.enum([
    'permissionChange',
    'upgrade',
    'pluginSetup',
    'governanceSettingsChange',
    'membershipChange',
    'tokenMint',
    'nestedExecution',
    'valueToUnknownTarget',
    'largeTreasuryShare',
    'undecodedAction',
    'simulationFailed',
    'metadataMissing',
    'actionCountMismatch',
]);

export type IProposalAnalysisFlag = z.infer<typeof proposalAnalysisFlagSchema>;

const actionRefsSchema = z.array(z.number().int().nonnegative());

export const proposalAnalysisFindingSchema = z.object({
    flag: proposalAnalysisFlagSchema,
    severity: proposalAnalysisSeveritySchema,
    actionRefs: actionRefsSchema,
    detail: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

export type IProposalAnalysisFinding = z.infer<
    typeof proposalAnalysisFindingSchema
>;

const parameterSchema = z.object({
    name: z.string().nullable(),
    type: z.string(),
    value: z.string(),
});

const transferSchema = z.object({
    tokenAddress: z.string(),
    symbol: z.string().nullable(),
    decimals: z.number().nullable(),
    recipient: z.string(),
    amountRaw: z.string(),
    amount: z.string().nullable(),
    amountUsd: z.number().nullable(),
    shareOfTreasury: z.number().nullable(),
    shareOfAssetBalance: z.number().nullable(),
});

export const proposalAnalysisActionSchema = z.object({
    index: z.number().int().nonnegative(),
    parentIndex: z.number().int().nonnegative().nullable(),
    depth: z.number().int().nonnegative(),
    type: z.string(),
    to: z.string(),
    targetKind: proposalAnalysisTargetKindSchema,
    targetName: z.string().nullable(),
    value: z.string(),
    selector: z.string().nullable(),
    signature: z.string().nullable(),
    functionName: z.string().nullable(),
    notice: z.string().nullable(),
    parameters: z.array(parameterSchema),
    decoded: z.boolean(),
    transfer: transferSchema.nullable(),
    destinationChainId: z.number().nullable(),
});

export type IProposalAnalysisAction = z.infer<
    typeof proposalAnalysisActionSchema
>;

const stageSchema = z.object({
    stageIndex: z.number(),
    name: z.string().nullable(),
    approvalThreshold: z.number().nullable(),
    vetoThreshold: z.number().nullable(),
    voteDuration: z.number().nullable(),
});

// Everything the model is allowed to reason about. Computed by the backend from indexed data;
// the model reads it as trusted structured facts and refers to actions by `index`.
export const proposalAnalysisFactPackSchema = z.object({
    contractVersion: z.number().int(),
    proposal: z.object({
        id: z.string(),
        network: z.string(),
        daoAddress: z.string(),
        daoName: z.string().nullable(),
        pluginAddress: z.string(),
        pluginSubdomain: z.string().nullable(),
        creatorAddress: z.string(),
        startDate: z.number(),
        endDate: z.number(),
        isSubProposal: z.boolean(),
        executed: z.boolean(),
        hasTitle: z.boolean(),
        hasSummary: z.boolean(),
        hasDescription: z.boolean(),
    }),
    governance: z.object({
        votingMode: z.number().nullable(),
        supportThreshold: z.number().nullable(),
        minParticipation: z.number().nullable(),
        minDuration: z.number().nullable(),
        minApprovals: z.number().nullable(),
        onlyListed: z.boolean().nullable(),
        stages: z.array(stageSchema),
    }),
    treasury: z.object({
        tvlUsd: z.number().nullable(),
        outflowUsd: z.number().nullable(),
        outflowShare: z.number().nullable(),
    }),
    actions: z.array(proposalAnalysisActionSchema),
    simulation: z.object({
        status: z.enum(['success', 'failed']).nullable(),
        runAt: z.number().nullable(),
    }),
    integrity: z.object({
        decoding: z.boolean(),
        rawActionsCount: z.number().int(),
        topLevelActionsCount: z.number().int(),
        undecodedActionsCount: z.number().int(),
        actionsCountMismatch: z.boolean(),
    }),
});

export type IProposalAnalysisFactPack = z.infer<
    typeof proposalAnalysisFactPackSchema
>;

// Author-written text of the proposal. Carried separately from the fact pack because it is
// untrusted: in a permissionless DAO anyone writes it, so the service fences it as data.
export const proposalAnalysisTextSchema = z.object({
    title: z.string().nullable(),
    summary: z.string().nullable(),
    description: z.string().nullable(),
});

export const proposalAnalysisRequestSchema = z.object({
    contractVersion: z.literal(proposalAnalysisContractVersion),
    factPack: proposalAnalysisFactPackSchema,
    findings: z.array(proposalAnalysisFindingSchema),
    text: proposalAnalysisTextSchema,
});

export type IProposalAnalysisRequest = z.infer<
    typeof proposalAnalysisRequestSchema
>;

// What the model writes, and what the backend stores and the app renders. There is deliberately
// no field for an amount, an address or a token: every claim points at fact-pack actions through
// `actionRefs`, and the renderer fills in the values from the pack. A model that could emit its
// own numbers would be a treasury tool that hallucinates figures.
export const proposalAnalysisReportSchema = z.object({
    headline: z.string().min(1).max(200),
    whatItDoes: z
        .array(
            z.object({
                text: z.string().min(1).max(400),
                actionRefs: actionRefsSchema,
            }),
        )
        .min(1)
        .max(8),
    intentMismatch: z.object({
        verdict: proposalAnalysisIntentVerdictSchema,
        explanation: z.string().min(1).max(600),
        actionRefs: actionRefsSchema,
    }),
    whyItMatters: z.string().min(1).max(800),
    openQuestions: z.array(z.string().min(1).max(300)).max(6),
    severity: proposalAnalysisSeveritySchema,
});

export type IProposalAnalysisReport = z.infer<
    typeof proposalAnalysisReportSchema
>;

export const proposalAnalysisResponseSchema = z.object({
    contractVersion: z.literal(proposalAnalysisContractVersion),
    report: proposalAnalysisReportSchema,
    // The floor the rules gave; `report.severity` is max(rules, model).
    rulesSeverity: proposalAnalysisSeveritySchema,
    // The model that actually answered (under a gateway fallback this differs from the requested
    // model) and the prompt version the report was written with.
    model: z.string(),
    promptVersion: z.string(),
});

export type IProposalAnalysisResponse = z.infer<
    typeof proposalAnalysisResponseSchema
>;

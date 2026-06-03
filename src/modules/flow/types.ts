import type { IFlowIndexedStep } from './canvas/flowGraphTypes';

export type FlowPolicyStatus =
    | 'ready'
    | 'live'
    | 'cooldown'
    | 'awaiting'
    | 'paused'
    | 'never';

export type FlowPolicyStrategy =
    | 'Stream'
    | 'Epoch transfer'
    | 'Burn'
    | 'CoW swap'
    | 'Uniswap swap'
    | 'Claimer'
    | 'Multi-dispatch'
    | 'Router';

/**
 * Canonical symbols we have dedicated styling for. Widened to `string` so the Envio-driven
 * data source can surface any ERC-20 symbol without casts; unknown tokens fall back to a
 * neutral chip color via `getFlowToken()` in `flowFormatters`.
 */
export type FlowTokenSymbol = 'USDC' | 'MERC' | 'WETH' | (string & {});

export interface IFlowToken {
    symbol: FlowTokenSymbol;
    color: string;
    decimals: number;
}

export interface IFlowRecipient {
    address: string;
    /**
     * Pre-resolved human-readable label. Derived from the client-side address book
     * (DAO, linked accounts, REST policies, burn) whenever possible, falling back
     * to a truncated address for unknown recipients. UI components should prefer
     * `FlowAddressLabel` which additionally enriches `unknown` labels with ENS.
     */
    name: string;
    /**
     * Synchronously-known ENS (e.g. from DAO metadata). Asynchronous ENS resolution
     * for unknown addresses happens at render time in `FlowAddressLabel`.
     */
    ens?: string | null;
    /**
     * Role hint from the address book — lets callers tone the chip colour
     * (e.g. burn addresses render with a critical accent).
     */
    role?: 'dao' | 'linkedaccount' | 'router' | 'subrouter' | 'burn';
    ratio?: string;
    pct?: number;
    groupLabel?: string;
}

export interface IFlowDispatch {
    id: string;
    at: string;
    /**
     * Primary amount + token for the dispatch. For swap dispatches, this is the OUT leg
     * (what downstream recipients received); callers should read `amountIn`/`tokenIn` for
     * the IN leg.
     */
    amount: number;
    token: FlowTokenSymbol;
    /**
     * Uniswap / CoW swap IN leg — token that went *into* the swap router.
     * Populated for `uniswapRouter` strategies (decoded from `exactInputSingle`).
     */
    amountIn?: number;
    tokenIn?: FlowTokenSymbol;
    /**
     * Uniswap / CoW swap OUT leg — token that came *out* of the swap. Currently
     * only populated when an outbound transfer to a non-swap recipient was
     * observed in the same execution (rare on Uniswap, common on CoW). Falls
     * back to the REST-declared target token in the UI when unknown.
     */
    amountOut?: number;
    tokenOut?: FlowTokenSymbol;
    recipientsCount: number;
    topRecipients: IFlowRecipient[];
    txHash: string;
    /**
     * When the dispatch tx was executed via a governance proposal we also
     * surface the proposal slug so the chart tooltip / activity feed can
     * deep-link into the proposal page.
     */
    proposalId?: string;
    proposalSlug?: string;
    /**
     * Outcome of the dispatch. When omitted defaults to a successful dispatch.
     * `skipped` = the strategy reverted (e.g. gate closed) and the dispatcher
     * recorded a `StrategyFailed` event without moving any money.
     */
    status?: 'ok' | 'failed' | 'skipped';
    failureReason?: string;
    /** Decoded revert reason when `status === 'skipped'`. */
    skippedReason?: string;
    /**
     * Multi-dispatch / orchestrator context — present when this dispatch is
     * a single leg of an orchestrator's `dispatch()` call (e.g. the LMM
     * dispatcher firing Wrap → UniV2 LP → CowSwap in sequence).  Each leg
     * lands as its own IFlowDispatch row; consumers use these fields to
     * label rows by leg ("#0 · Wrap leg") and to filter the cumulative
     * chart to legs that share the orchestrator's headline token.
     */
    legIndex?: number;
    legKind?:
        | 'WRAP'
        | 'UNIV2_LIQUIDITY'
        | 'GATED_COWSWAP'
        | 'COWSWAP'
        | 'TRANSFER'
        | 'EPOCH_TRANSFER'
        | 'BURN'
        | 'UNKNOWN';
}

export type FlowEventKind =
    | 'policyInstalled'
    | 'policyUninstalled'
    | 'paused'
    | 'resumed'
    | 'settingsUpdated'
    | 'proposalApplied'
    | 'recipientsUpdated'
    | 'dispatchFailed';

export interface IFlowEvent {
    id: string;
    kind: FlowEventKind;
    at: string;
    title: string;
    description: string;
    proposalId?: string;
    proposalSlug?: string;
    txHash?: string;
}

export interface IFlowPolicySchemaAllowance {
    type: string;
    detail: string;
}

export interface IFlowPolicySchemaModel {
    type: string;
    detail: string;
}

export interface IFlowPolicySchema {
    source: string;
    allowance: IFlowPolicySchemaAllowance;
    model: IFlowPolicySchemaModel;
    recipients: IFlowRecipient[];
    subRouters?: IFlowPolicySubRouter[];
}

export interface IFlowPolicySubRouter {
    id: string;
    title: string;
    subtitle?: string;
    allowance?: IFlowPolicySchemaAllowance;
    model?: IFlowPolicySchemaModel;
    recipients?: IFlowRecipient[];
    subRouters?: IFlowPolicySubRouter[];
}

export interface IFlowLastDispatch {
    amount: number;
    token: FlowTokenSymbol;
    at: string;
    txHash: string;
    recipientsCount: number;
}

/**
 * Amount currently queued but not yet dispatched by the policy.
 */
export interface IFlowPending {
    amount: number;
    token: FlowTokenSymbol;
}

/**
 * Cooldown window between dispatches for cadenced policies.
 */
export interface IFlowCooldown {
    /**
     * Timestamp (ISO) at which the policy becomes dispatchable again.
     */
    readyAt: string;
    /**
     * Total duration of the cooldown window in milliseconds. Used to render
     * the progress ring on the policy card.
     */
    totalMs: number;
}

/**
 * Snapshot of the latest failed dispatch attempt, surfaced on the card and
 * detail page footer.
 */
export interface IFlowFailedLastDispatch {
    at: string;
    reason: string;
    txHash?: string;
}

export interface IFlowSwapPair {
    in: FlowTokenSymbol;
    out: FlowTokenSymbol;
}

export interface IFlowPolicy {
    id: string;
    /**
     * Lowercase plugin address, used for `/settings/automations/{address}` deep links
     * and for looking up sub-routers in Multi-dispatch orchestrators.
     */
    address: string;
    name: string;
    description: string;
    strategy: FlowPolicyStrategy;
    strategyLong: string;
    token: FlowTokenSymbol;
    /**
     * For swap-style routers (`uniswapRouter`, `cowSwapRouter`) the IN/OUT token pair —
     * populated from REST metadata and/or the most recent decoded swap leg.
     */
    swapPair?: IFlowSwapPair;
    status: FlowPolicyStatus;
    statusLabel: string;
    verb: string;

    createdAt: string;
    installedViaProposal: string;
    installedViaProposalSlug?: string;
    installedViaProposalId?: string;
    /**
     * Human-readable title of the governance proposal that installed this
     * policy, surfaced on the detail page header. Falls back to
     * `installedViaProposal` (the slug / `—` placeholder) when the REST
     * proposal list doesn't expose a title.
     */
    installedViaProposalTitle?: string;
    installTxHash: string;
    /**
     * Timestamp (ISO) of the last `UNINSTALLED` event, present only for archived policies.
     * Used to sort the "Archived" pill and to render the uninstall relative chip.
     */
    uninstalledAt?: string;

    totalDistributed: number;
    forecast30d: number;
    nextDispatchLabel: string;
    nextDispatchAt?: string;

    pending: IFlowPending | null;
    cooldown: IFlowCooldown | null;
    failedLastDispatch?: IFlowFailedLastDispatch;

    lastDispatch?: IFlowLastDispatch;

    recipients: IFlowRecipient[];
    recipientsMore: number;
    recipientGroup: string;

    dispatches: IFlowDispatch[];
    events: IFlowEvent[];
    schema: IFlowPolicySchema;
}

/**
 * Bucketed view of `IFlowPolicy[]` consumed by `FlowPoliciesSection` to render the pill
 * filter. Buckets:
 * - `active`    — policies that have dispatched at least once and are still installed.
 * - `neverRun`  — installed policies that have never dispatched (`NEVER_RUN`).
 * - `archived`  — uninstalled policies, ordered by `uninstalledAt` DESC.
 */
export interface IFlowGroupedPolicies {
    active: IFlowPolicy[];
    neverRun: IFlowPolicy[];
    archived: IFlowPolicy[];
}

/**
 * A single run of a Multi-dispatch orchestrator. Runs are derived client-side by
 * grouping the executions of sub-routers by `txHash` — see `envioFlowMapper.ts`.
 */
export interface IFlowOrchestratorRun {
    id: string;
    at: string;
    txHash: string;
    legs: IFlowOrchestratorLeg[];
    /**
     * Provenance-tagged steps for this run, normalised from the indexer's
     * `FlowStep`/`FlowEdge`. When present the workbench canvas projects these
     * (real settled amounts) instead of reconstructing legs heuristically.
     * One entry per executed/skipped leg — a subset when legs were skipped.
     */
    indexedSteps?: IFlowIndexedStep[];
}

export interface IFlowOrchestratorLeg {
    policyId: string;
    policyName: string;
    strategy: FlowPolicyStrategy;
    amountOut: number;
    tokenOut: FlowTokenSymbol;
    amountIn?: number;
    tokenIn?: FlowTokenSymbol;
    recipientsCount: number;
    status: 'ok' | 'failed' | 'skipped';
}

/**
 * Embedded strategy of a DispatcherPlugin — surfaced when the dispatcher
 * itself owns the strategy code (Lido demo: Wrap / UniV2 / GatedCowSwap)
 * rather than fanning out to separately-installed plugin policies.  This is
 * additional to `IFlowOrchestrator.chain` (which remains the source of truth
 * for legacy multi-routers) and is rendered as a horizontal chip chain on
 * the dispatcher card.
 */
export type FlowEmbeddedStrategyKind =
    | 'wrap'
    | 'univ2Liquidity'
    | 'gatedCowSwap'
    | 'cowSwap'
    | 'transfer'
    | 'epochTransfer'
    | 'burn'
    | 'unknown';

export interface IFlowEmbeddedBudget {
    kind: 'streamUntil' | 'full' | 'required' | 'unknown';
    /** Floor reserve, raw token base units (string to avoid bigint JSON). */
    floorEpochs?: string;
    /** Target epoch for `StreamUntilBudget` strategies. */
    targetEpoch?: string;
}

export interface IFlowEmbeddedGate {
    kind: 'priceFloor' | 'unknown';
    threshold?: string;
    /** Max acceptable oracle staleness, seconds. */
    maxStaleness?: string;
}

export interface IFlowEmbeddedEpoch {
    /** Epoch length in seconds. */
    epochLength?: string;
}

export interface IFlowEmbeddedStrategy {
    /** Stable id — strategy contract address. */
    id: string;
    address: string;
    kind: FlowEmbeddedStrategyKind;
    /** Position in the dispatcher's strategy array (display order). */
    index: number;
    paused: boolean;
    /** Optional human label derived from `kind` (falls back to the kind). */
    label: string;
    budget?: IFlowEmbeddedBudget;
    gate?: IFlowEmbeddedGate;
    epochProvider?: IFlowEmbeddedEpoch;
}

/**
 * A Multi-dispatch / Multi-router / Multi-claimer policy, lifted out of the standard
 * policies list and rendered in a dedicated "Orchestrators" section.
 */
export interface IFlowOrchestrator {
    id: string;
    address: string;
    name: string;
    description: string;
    strategy: FlowPolicyStrategy;
    status: FlowPolicyStatus;
    statusLabel: string;

    createdAt: string;
    installedViaProposalId?: string;
    installedViaProposalSlug?: string;
    installedViaProposalTitle?: string;
    installTxHash: string;
    uninstalledAt?: string;

    /**
     * Child policies this orchestrator fans out to, in execution order (as declared by
     * REST `strategy.subRouters`). Missing children (unknown plugin address) are kept as
     * `null` so the diagram can show `[?]` placeholders without collapsing the chain.
     */
    chain: Array<IFlowPolicy | null>;
    /**
     * When the dispatcher owns its strategies inline (Lido Money Machine
     * pattern), the embedded chain is surfaced here in execution order.  When
     * present, the dispatcher card renders this list instead of (or in
     * addition to) `chain`.
     */
    embeddedStrategies?: IFlowEmbeddedStrategy[];
    runs: IFlowOrchestratorRun[];
    /**
     * Latest indexed step per strategy across all runs — the composite the
     * default "live" canvas view projects so the full pipeline always renders
     * each leg's most recent real amounts, even when individual runs skipped
     * legs. Empty until the dispatcher has produced any `FlowStep`.
     */
    latestIndexedSteps?: IFlowIndexedStep[];
    lastRunAt?: string;
    totalRuns: number;
}

export interface IFlowDao {
    network: string;
    addressOrEns: string;
    name: string;
    avatarColor: string;
}

export interface IFlowDaoData {
    dao: IFlowDao;
    /**
     * Flat list of leaf (non-orchestrator) policies. Kept for back-compat with callers
     * that iterate everything (chart/detail/activity preview). UI that wants the
     * pill-filtered view should read `groupedPolicies` instead.
     */
    policies: IFlowPolicy[];
    /**
     * Leaf policies bucketed for the Policies pill switcher on the Overview page.
     */
    groupedPolicies: IFlowGroupedPolicies;
    /**
     * Multi-dispatch policies lifted into their own section. Each orchestrator owns a
     * chain of sub-policies + a list of runs grouped by transaction hash.
     */
    orchestrators: IFlowOrchestrator[];
    /**
     * Mirror of each orchestrator as an `IFlowPolicy` (same shape leaf policies use).
     * Lets the policy detail page resolve `/flow/policies/<orchestratorId>` without
     * polluting the leaf-only `policies` list (KPI / Policies-section consumers
     * still iterate `policies` to avoid double-counting orchestrators alongside
     * their inline `FlowMultiDispatchCard`). The detail page itself falls back
     * to this array when a policy id can't be found in `policies`.
     */
    orchestratorPolicies: IFlowPolicy[];
    recipients: IFlowRecipientAggregate[];
}

export interface IFlowRecipientAggregate {
    address: string;
    name: string;
    /**
     * Resolved ENS for the recipient when synchronously known (e.g. DAO ENS).
     */
    ens?: string | null;
    /**
     * Role hint from the address book — mirrors `IFlowRecipient.role`.
     */
    role?: IFlowRecipient['role'];
    group: string;
    fromPolicyIds: string[];
    amountsByToken: Partial<Record<FlowTokenSymbol, number>>;
    dispatchCount: number;
    lastReceivedAt: string;
}

export const FLOW_TOKENS: Record<string, IFlowToken> = {
    USDC: { symbol: 'USDC', color: '#2775ca', decimals: 2 },
    MERC: { symbol: 'MERC', color: '#003bf5', decimals: 0 },
    WETH: { symbol: 'WETH', color: '#1f2933', decimals: 3 },
};

/**
 * Neutral styling for any ERC-20 we haven't curated colors for (typical of live Envio data).
 */
export const FLOW_TOKEN_FALLBACK_COLOR = '#64748b';

/**
 * Statuses that indicate the policy is actively operational — used across
 * Lede/KPI aggregates.
 */
export const FLOW_ACTIVE_STATUSES: readonly FlowPolicyStatus[] = [
    'ready',
    'live',
    'cooldown',
];

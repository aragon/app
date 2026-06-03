/**
 * Shape of the responses returned by the capital-flow-indexer (Envio/Hasura).
 * Mirrors `schema.graphql` in `capital-flow-indexer/`.
 *
 * Raw token amounts are returned as strings by Hasura (BigInt-safe); callers must parse
 * them to BigInt before doing arithmetic, or to number after normalising by `token.decimals`.
 */

export interface IEnvioToken {
    id: string;
    address: string;
    symbol: string;
    decimals: number;
}

export type EnvioTransferDecodedFrom =
    | 'transfer'
    | 'transferFrom'
    | 'native'
    | 'swapIn'
    | 'wrap'
    | 'univ2AddLiquidity'
    | 'swapPresign'
    | 'approve'
    | 'unknown';

export interface IEnvioExecutionTransfer {
    id: string;
    amount: string;
    to: string;
    decodedFrom: EnvioTransferDecodedFrom;
    actionIndex: number;
    token: IEnvioToken;
}

export type EnvioExecutionKind = 'DISPATCH' | 'CLAIM' | 'DISPATCH_SKIPPED';

export interface IEnvioPolicyExecution {
    id: string;
    kind: EnvioExecutionKind;
    blockNumber: string;
    blockTimestamp: string;
    txHash: string;
    logIndex: number;
    transferCount: number;
    decodedTransferCount: number;
    transfers: IEnvioExecutionTransfer[];
    // Multi-dispatch context — present when the parent policy is a DispatcherPlugin.
    strategyIndex?: number | null;
    strategy?: IEnvioStrategyRef | null;
    skipped?: boolean | null;
    skippedReason?: string | null;
    swapOrders?: IEnvioSwapOrder[];
}

/**
 * Reference to an embedded strategy when loaded via a PolicyExecution.  The
 * full Strategy entity (with budget/gate/etc) is queried separately via
 * `Policy.strategies`.
 */
export interface IEnvioStrategyRef {
    id: string;
    address: string;
    kind: EnvioEmbeddedStrategyKind;
    index?: number | null;
}

export type EnvioEmbeddedStrategyKind =
    | 'WRAP'
    | 'UNIV2_LIQUIDITY'
    | 'GATED_COWSWAP'
    | 'COWSWAP'
    | 'TRANSFER'
    | 'EPOCH_TRANSFER'
    | 'BURN'
    | 'UNKNOWN';

export type EnvioBudgetKind = 'STREAM_UNTIL' | 'FULL' | 'REQUIRED' | 'UNKNOWN';
export type EnvioGateKind = 'PRICE_FLOOR' | 'UNKNOWN';

export interface IEnvioBudget {
    id: string;
    address: string;
    kind: EnvioBudgetKind;
    floorEpochs?: string | null;
    targetEpoch?: string | null;
    epochProviderAddress?: string | null;
    initializedAt: string;
}

export interface IEnvioGate {
    id: string;
    address: string;
    kind: EnvioGateKind;
    threshold?: string | null;
    maxStaleness?: string | null;
    oracle?: string | null;
    baseToken?: string | null;
    quoteToken?: string | null;
}

export interface IEnvioEpochProvider {
    id: string;
    address: string;
    epochLength?: string | null;
}

export interface IEnvioStrategy {
    id: string;
    address: string;
    kind: EnvioEmbeddedStrategyKind;
    index?: number | null;
    configJson?: string | null;
    paused: boolean;
    budget?: IEnvioBudget | null;
    gate?: IEnvioGate | null;
    epochProvider?: IEnvioEpochProvider | null;
}

/**
 * CowSwap pre-signed order, attached to a PolicyExecution + Strategy.
 */
export interface IEnvioSwapOrder {
    id: string;
    orderUid: string;
    sellToken: IEnvioToken;
    buyToken: IEnvioToken;
    sellAmount: string;
    buyAmount: string;
    validTo: string;
    feeAmount: string;
    postedAt: string;
    strategy?: Pick<IEnvioStrategyRef, 'id' | 'address' | 'kind'>;
}

export type EnvioPolicyEventKind =
    | 'INSTALLED'
    | 'INITIALIZED'
    | 'UNINSTALLED'
    | 'SETTINGS_UPDATED'
    | 'FAILSAFE_UPDATED'
    | 'STRATEGY_FAILED'
    | 'STRATEGY_PAUSED'
    | 'STRATEGY_UNPAUSED'
    | 'TARGET_EPOCH_UPDATED'
    | 'FLOOR_EPOCHS_UPDATED'
    | 'EPOCH_LENGTH_UPDATED'
    | 'GATE_THRESHOLD_UPDATED'
    | 'GATE_STALENESS_UPDATED'
    | 'COWSWAP_SETTINGS_UPDATED';

export interface IEnvioPolicyEvent {
    id: string;
    kind: EnvioPolicyEventKind;
    blockTimestamp: string;
    txHash: string;
    description: string;
    contextJson?: string | null;
}

export type EnvioPolicyStatus = 'NEVER_RUN' | 'RUNNING' | 'UNINSTALLED';

/**
 * Matches `IPolicyStrategyType` on the backend + `REPO_TO_STRATEGY` on the indexer.
 */
export type EnvioStrategyType =
    | 'router'
    | 'burnRouter'
    | 'claimer'
    | 'multiDispatch'
    | 'multiRouter'
    | 'multiClaimer'
    | 'uniswapRouter'
    | 'cowSwapRouter'
    // New (Lido demo) — embedded strategy kinds, surface only when standalone.
    | 'wrapStrategy'
    | 'univ2LiquidityStrategy'
    | 'gatedCowSwapStrategy'
    | 'transferStrategy'
    | 'epochTransferStrategy'
    | 'burnStrategy';

export interface IEnvioDao {
    id: string;
    address: string;
    chainId: string;
    name?: string | null;
    description?: string | null;
    avatarUrl?: string | null;
}

export interface IEnvioPolicy {
    id: string;
    pluginAddress: string;
    strategyType: EnvioStrategyType;
    pluginId?: string | null;
    pluginSetupRepo: string;
    status: EnvioPolicyStatus;
    installedAt: string;
    installTxHash: string;
    installBlockNumber: string;
    totalDispatches: string;
    lastDispatchAt?: string | null;
    dao: IEnvioDao;
    lastExecution?: IEnvioPolicyExecution | null;
    executions: IEnvioPolicyExecution[];
    events: IEnvioPolicyEvent[];
    // For multi-dispatch / dispatcher policies — the embedded strategies, in
    // dispatch order.  Empty for legacy single-dispatch routers + claimers.
    strategies?: IEnvioStrategy[];
}

export interface IEnvioRecipientAggregate {
    id: string;
    recipient: string;
    totalAmount: string;
    transferCount: number;
    firstAt: string;
    lastAt: string;
    token: IEnvioToken;
    policy: {
        id: string;
        pluginAddress: string;
        strategyType: EnvioStrategyType;
    };
    dao: Pick<IEnvioDao, 'id' | 'address'>;
}

// ---------------------------------------------------------------------------
// Provenance-tagged flow graph (FlowStep / FlowEdge / SwapFill)
// ---------------------------------------------------------------------------

/**
 * How the indexer classifies an amount's trustworthiness. Aligned 1:1 with
 * `enum Provenance` in `capital-flow-indexer/schema.graphql` and with the
 * vendored `lido-preview` Provenance. The app collapses these to a
 * three-level {@link FlowFidelity} (`real` / `estimated` / `opaque`).
 */
export type EnvioProvenance =
    | 'DETERMINISTIC'
    | 'ONCHAIN_EVENT'
    | 'SETTLED'
    | 'ESTIMATED_VIA_QUOTER'
    | 'ESTIMATED_VIA_ORACLE'
    | 'OPAQUE';

/**
 * Role of a {@link IEnvioFlowEdge} — lets the canvas infer topology without
 * re-decoding calldata:
 *   VAULT_OUT — vault → strategy/router (budget spent, swap sell, LP input).
 *   VAULT_IN  — produced back to the vault (wrap output, LP minted, swap fill).
 *   EXTERNAL  — vault → a real recipient (transfer/native to a non-vault addr).
 */
export type EnvioFlowEdgeRole = 'VAULT_OUT' | 'VAULT_IN' | 'EXTERNAL';

export interface IEnvioFlowEdge {
    id: string;
    role: EnvioFlowEdgeRole;
    token: IEnvioToken;
    from: string;
    to: string;
    /** Raw units. `0` + provenance `OPAQUE` while still unknown (LP pre-Mint). */
    amount: string;
    provenance: EnvioProvenance;
    /** `decodedFrom` plus `wrapOut` | `univ2LpMinted` | `swapFill`. */
    decodedFrom: string;
    seq: number;
    pending: boolean;
}

export type EnvioFlowStepStatus =
    | 'EXECUTED'
    | 'NO_OP'
    | 'SKIPPED_PAUSED'
    | 'SKIPPED_GATED'
    | 'FAILED'
    | 'OPAQUE';

/**
 * Per-leg provenance node the workbench canvas PROJECTS (rather than
 * reconstructing the graph with heuristics). One per DispatchHandled leg
 * (EXECUTED / NO_OP) and one per StrategyFailed leg (SKIPPED_* / FAILED).
 */
export interface IEnvioFlowStep {
    id: string;
    index: number;
    kind: EnvioEmbeddedStrategyKind;
    status: EnvioFlowStepStatus;
    reason?: string | null;
    /** Weakest provenance across this step's edges. */
    provenance: EnvioProvenance;
    /** True while any edge amount is still unsettled (CoW order awaiting fill). */
    pending: boolean;
    blockTimestamp: string;
    txHash: string;
    /** `${chainId}:${pluginAddress}` of the dispatcher policy. */
    dispatcher: { id: string; pluginAddress: string };
    strategy?: IEnvioStrategyRef | null;
    execution?: { id: string; txHash: string } | null;
    edges: IEnvioFlowEdge[];
}

export interface IFlowDaoDataResponse {
    Policy: IEnvioPolicy[];
    RecipientAggregate: IEnvioRecipientAggregate[];
    /**
     * Provenance-tagged flow steps for every dispatcher in the DAO set, newest
     * first. Grouped client-side by dispatcher + `txHash` into orchestrator
     * runs (see `envioFlowMapper.ts`). Empty until a dispatcher has run.
     */
    FlowStep: IEnvioFlowStep[];
}

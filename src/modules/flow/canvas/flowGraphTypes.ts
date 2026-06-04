/**
 * Generic, data-driven model for the Money Machine flow canvas.
 *
 * NO HARDCODE: nothing here knows about Lido, stETH, or a fixed three-strategy
 * pipeline. The graph is produced by {@link buildFlowGraph} from a normalized
 * {@link IFlowMachineDescriptor} (static structure, derived from the indexer's
 * generic taxonomy) merged with optional live/replay {@link IFlowDynamics}
 * (amounts, states). Any flow — router, claimer, or a multi-dispatch
 * orchestrator with arbitrary strategies/tokens — renders correctly by feeding
 * its descriptor + dynamics through the same path.
 *
 * The shape intentionally mirrors the vendored Claude Design "canvas" data
 * (source + strategy nodes with hanging input "parts" + fidelity-aware edges)
 * so the ported visual components consume it 1:1.
 */

import type { FlowEmbeddedStrategyKind } from '../types';

/** What a node represents on the canvas. */
export type FlowGraphNodeKind = 'source' | 'strategy' | 'recipient';

/**
 * Edge semantics, used purely for styling/labelling. The flow is hub-and-spoke
 * around the ONE funding vault (the DAO): every leg independently draws from the
 * vault and returns proceeds to it. There are NO inferred leg→leg "pipeline"
 * edges — that fabricated a chain the contract never executes and hid the value
 * a leg retains in the vault.
 * - `feeds`        — vault → leg (a token the leg consumes this dispatch).
 * - `returns`      — leg → vault (proceeds looped back to the DAO).
 * - `distributes`  — leg → an external recipient (a genuine outbound transfer to
 *                    a non-vault address).
 */
export type FlowGraphEdgeKind = 'feeds' | 'returns' | 'distributes';

/**
 * How sure we are about an amount on an edge — drives solid/dashed/ghost
 * styling and the `~` prefix. Mirrors the indexer provenance classes
 * (deterministic/estimated/opaque) collapsed to what the UI needs.
 */
export type FlowFidelity = 'real' | 'estimated' | 'opaque';

/** Runtime state of a strategy node — drives colour, badge, pulsing. */
export type FlowRuntimeState =
    | 'idle'
    | 'accumulating'
    | 'firing'
    | 'blocked'
    | 'done'
    | 'failed'
    | 'skipped';

/** The role a hanging "part" plays beneath a strategy node. */
export type FlowSubInputRole = 'budget' | 'gate' | 'epoch';

/**
 * A hanging input "part" beneath a strategy node (budget / gate / epoch
 * provider) — the N8N-style sub-node. Static fields come from the descriptor;
 * live fields (`reading`, `status`, `detail`, `epoch`) are filled from
 * dynamics.
 */
export interface IFlowSubInput {
    role: FlowSubInputRole;
    /** Generic kind from the indexer taxonomy, e.g. `full` | `streamUntil` |
     *  `required` (budget), `priceFloor` (gate). Never an LMM-specific value. */
    kind: string;
    /** Human label resolved via the primitive registry. */
    label: string;
    /** Live token symbol for `reading`, when the overlay supplies one. */
    token?: string;
    /** Live numeric reading (e.g. budget amount available this epoch). */
    reading?: number | null;
    /** Static note derived from config, e.g. "7d floor · target epoch 49,283". */
    note?: string;
    /** Richer live detail, e.g. the gate's oracle price vs threshold + staleness. */
    detail?: string;
    /** Gate open/closed (overlay-provided). */
    status?: 'open' | 'closed';
    /** Epoch-provider current epoch (overlay-provided). */
    epoch?: number;
    /** Epoch length label, e.g. "1h". */
    epochLength?: string;
}

export interface IFlowVaultBalance {
    token: string;
    amount: number;
}

/**
 * Net change to the DAO vault for one token after a dispatch:
 * `delta = produced-back-to-vault − consumed-from-vault`. Surfaced on the vault
 * node so the canvas answers "how much actually lands back in the DAO" — the
 * retained value the old inferred-pipeline model used to hide. `opaque` marks a
 * token whose net includes an unsettled (null) amount, so the delta is partial.
 */
export interface IFlowNetEntry {
    token: string;
    delta: number;
    opaque?: boolean;
}

/** One token a strategy leg produces, and where it lands. `toVault` = loops
 *  back to the DAO vault; otherwise `toLabel` names the external recipient. */
export interface IFlowNodeOutput {
    token: string;
    amount: number | null;
    fidelity: FlowFidelity;
    toVault: boolean;
    toLabel: string;
}

/**
 * A canvas node with layout geometry applied. Geometry (`x/y/w/h`) is assigned
 * by {@link layoutFlowGraph}; everything else by {@link buildFlowGraph}.
 */
export interface IFlowGraphNode {
    id: string;
    kind: FlowGraphNodeKind;
    address?: string;
    /** Strategy order within the flow — drives the layout column. */
    index?: number;
    title: string;
    subtitle?: string;
    /** Strategy primitive kind → icon/label via the registry. */
    primitiveKind?: FlowEmbeddedStrategyKind;
    state: FlowRuntimeState;
    /** Short status line under a strategy node (e.g. "blocked: gate closed"). */
    badge?: string;
    /** Hanging "parts" beneath a strategy node. Empty for source/recipient. */
    inputs: IFlowSubInput[];
    /** Static config parameters (slippage, target token, …) for a strategy node,
     *  shown on the card + inspector. Copied from the descriptor step. */
    params?: IFlowStrategyParam[];
    /** Vault balances for the `source` node. */
    balances?: IFlowVaultBalance[];
    /** Net token deltas to the vault after a dispatch (vault `source` node). */
    net?: IFlowNetEntry[];
    /** Where a strategy leg sends each token it produces — the vault (loops
     *  back) or a named external recipient. Drives the inspector's output row. */
    outputs?: IFlowNodeOutput[];
    /** Recipient node only: when exactly one leg feeds it, the address of that
     *  leg — the layout hangs the recipient beside it as a satellite. */
    attachedTo?: string;
    /** Layout geometry (px in the fixed-coordinate stage). */
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface IFlowGraphEdge {
    id: string;
    source: string;
    target: string;
    kind: FlowGraphEdgeKind;
    token?: string;
    /** `null` = opaque/unknown amount — the UI renders "pending", never a
     *  fabricated number. */
    amount?: number | null;
    fidelity: FlowFidelity;
    /** Stream-style edge labelled "/epoch". */
    perEpoch?: boolean;
    /** Animate a travelling token dot along this edge. */
    flowing?: boolean;
    /** Render the edge as blocked (gate closed / would-not-fire). */
    blocked?: boolean;
    /** When this movement happens — `settle` outputs (CoW fill) render in a
     *  distinct phase style and don't animate as part of the dispatch "now". */
    trigger?: FlowEdgeTrigger;
    note?: string;
}

export interface IFlowGraph {
    nodes: IFlowGraphNode[];
    edges: IFlowGraphEdge[];
    /** Fixed-coordinate stage bounds the canvas auto-fits to. */
    width: number;
    height: number;
    /** Non-null when the graph is a historical run (replay), else live. */
    runId?: string | null;
}

/* ------------------------------------------------------------------------- *
 * Descriptor — the STATIC structure of a flow, normalized from the indexer's
 * generic taxonomy (orchestrator embedded strategies / chain / leaf policy).
 * Carries no amounts or live state.
 * ------------------------------------------------------------------------- */

export interface IFlowSubInputDescriptor {
    role: FlowSubInputRole;
    kind: string;
    label: string;
    note?: string;
}

/** A single display-ready config parameter for a strategy (e.g. "Max slippage"
 *  → "0.50%"). Generic label/value pairs so the canvas renders them without any
 *  per-strategy knowledge; producers decide what to surface. */
export interface IFlowStrategyParam {
    label: string;
    value: string;
}

export interface IFlowStepDescriptor {
    index: number;
    address: string;
    kind: FlowEmbeddedStrategyKind;
    label: string;
    subtitle?: string;
    paused: boolean;
    inputs: IFlowSubInputDescriptor[];
    /** Optional static config parameters (slippage, target token, …) surfaced
     *  on the card/inspector. Empty/undefined when none are known. */
    params?: IFlowStrategyParam[];
}

export interface IFlowMachineDescriptor {
    /** Flow (orchestrator/policy) id. */
    id: string;
    source: { address?: string; label: string };
    steps: IFlowStepDescriptor[];
    recipient?: { address: string; label: string };
}

/* ------------------------------------------------------------------------- *
 * Dynamics — the LIVE or REPLAY layer. Generic shape so the producers
 * (StatusSnapshot overlay for live, IFlowOrchestratorRun for replay) stay
 * decoupled from buildFlowGraph. One entry per strategy step, matched to the
 * descriptor by `address` (preferred) or `index`.
 * ------------------------------------------------------------------------- */

/** When a flow materialises: at `dispatch()` time, or out-of-band later when the
 *  strategy's order settles (e.g. a CowSwap solver fill). Default `dispatch`. */
export type FlowEdgeTrigger = 'dispatch' | 'settle';

export interface IFlowEdgeFlow {
    token: string;
    /** `null` for opaque outputs (e.g. LP minted, swap fill pre-settlement). */
    amount: number | null;
    fidelity: FlowFidelity;
    perEpoch?: boolean;
    /** Output only: `true` when the token leaves to a genuine external recipient
     *  rather than looping back to the vault. Drives `distributes` vs `returns`. */
    external?: boolean;
    /** Output only: the external recipient address, when known. */
    to?: string;
    /** When this flow happens — `settle` for outputs that land out-of-band
     *  (CoW fill). Defaults to `dispatch` when unset. */
    trigger?: FlowEdgeTrigger;
}

/** Live reading for one hanging input, positionally matched to the
 *  descriptor step's `inputs`. */
export interface IFlowSubInputReading {
    token?: string;
    reading?: number | null;
    status?: 'open' | 'closed';
    detail?: string;
    epoch?: number;
    epochLength?: string;
}

export interface IFlowStepDynamics {
    address: string;
    index: number;
    state: FlowRuntimeState;
    badge?: string;
    /** Per-input readings, aligned by position with the descriptor's inputs. */
    inputReadings?: IFlowSubInputReading[];
    /** Tokens this step produces — looped back to the vault (`external` unset) or
     *  sent to an external recipient (`external: true`). Multiple are allowed. */
    outs?: IFlowEdgeFlow[];
    /** Tokens this step draws from the vault this dispatch (vault-out). */
    ins?: IFlowEdgeFlow[];
    skipReason?: string;
    blocked?: boolean;
}

export interface IFlowDynamics {
    /** Non-null when these dynamics represent a historical run (replay). */
    runId?: string | null;
    steps: IFlowStepDynamics[];
    /** Source-vault balances overlay. */
    balances?: IFlowVaultBalance[];
}

/* ------------------------------------------------------------------------- *
 * Indexed provenance graph — the app-side, decoupled normalisation of the
 * indexer's `FlowStep` / `FlowEdge` / `SwapFill` entities. This is what
 * {@link toIndexedDynamics} projects onto {@link IFlowDynamics}, replacing the
 * heuristic reconstruction the dashboard mapper used to do. Amounts are already
 * normalised to display numbers (or `null` when the provenance is opaque).
 * ------------------------------------------------------------------------- */

/** Where an indexed edge sits relative to the funding vault. */
export type FlowIndexedEdgeRole = 'vaultOut' | 'vaultIn' | 'external';

/** A normalised, provenance-tagged token movement attached to a step. */
export interface IFlowIndexedEdge {
    role: FlowIndexedEdgeRole;
    token: string;
    to: string;
    /** `null` when opaque (amount not yet settled, e.g. LP pre-Mint). */
    amount: number | null;
    fidelity: FlowFidelity;
    perEpoch?: boolean;
    pending: boolean;
}

/** Normalised execution status of an indexed step. */
export type FlowIndexedStatus =
    | 'executed'
    | 'noOp'
    | 'skippedPaused'
    | 'skippedGated'
    | 'failed'
    | 'opaque';

/**
 * One projected leg of an indexed run/overview, matched to a descriptor step by
 * `address` (preferred) or `index`. Carries the real, provenance-tagged edges
 * the indexer settled — no calldata heuristics.
 */
export interface IFlowIndexedStep {
    address: string;
    index: number;
    kind: FlowEmbeddedStrategyKind;
    status: FlowIndexedStatus;
    reason?: string;
    /** True while any edge amount is still unsettled. */
    pending: boolean;
    edges: IFlowIndexedEdge[];
}

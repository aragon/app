// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import type { TokenInfo } from './primitives';

/**
 * Structural snapshot of a deployed Capital Router configuration. Pure JSON
 * (bigints serialize as decimal strings via `stringify`). Stable between
 * runs for a given block.
 */
export type TopologyGraph = {
    version: 1;
    chainId: number;
    fetchedAtBlock: bigint;
    fetchedAt: string; // ISO 8601
    root: PluginNode;
    warnings: Warning[];
};

export type Warning = {
    code: string;
    message: string;
    path?: string; // dotted path into the graph, e.g. "root.strategies[0].budget"
};

// --- Plugins ----------------------------------------------------------------

export type PluginNode = DispatcherPluginNode | UnknownPluginNode;

export type DispatcherPluginNode = {
    kind: 'plugin.dispatch';
    address: Address;
    pluginId: string;
    dao: Address;
    strategies: StrategyNode[];
    failsafeStrategyMap: bigint;
};

export type UnknownPluginNode = {
    kind: 'plugin.unknown';
    address: Address;
    pluginId: string | null;
    dao: Address | null;
};

// --- Strategies -------------------------------------------------------------

export type StrategyNode =
    // CR vanilla strategies (kept as catch-alls / for mixed deployments).
    | TransferDispatchStrategyNode
    | BurnDispatchStrategyNode
    | EpochTransferDispatchStrategyNode
    // Lido custom strategies (Money Machine).
    | LidoWrapDispatchStrategyNode
    | LidoUniV2LiquidityDispatchStrategyNode
    | LidoGatedCowSwapDispatchStrategyNode
    // Fallback when a strategyId is not in the registry.
    | UnknownStrategyNode;

type StrategyCommon = {
    address: Address;
    strategyId: string;
    paused: boolean;
};

export type TransferDispatchStrategyNode = StrategyCommon & {
    kind: 'strategy.dispatch.transfer';
    budget: BudgetNode;
    splitter: SplitterNode;
    useSafeTransfer: boolean;
};

export type BurnDispatchStrategyNode = StrategyCommon & {
    kind: 'strategy.dispatch.burn';
    budget: BudgetNode;
};

export type EpochTransferDispatchStrategyNode = StrategyCommon & {
    kind: 'strategy.dispatch.epoch-transfer';
    budget: BudgetNode;
    splitter: SplitterNode;
    epochProvider: EpochProviderNode;
    lastDispatchedEpoch: bigint;
    useSafeTransfer: boolean;
};

/** Wraps the DAO's stETH balance into wstETH. */
export type LidoWrapDispatchStrategyNode = StrategyCommon & {
    kind: 'strategy.dispatch.lido.wrap';
    budget: BudgetNode;
    /** Target wstETH wrapper contract — `wstETH.wrap(stETH)`. */
    wstETH: Address;
    /** Token info for the wstETH wrapper (symbol/decimals) — surfaced so the
     *  Wrap predictor can build a typed `produces` delta for the post-wrap
     *  snapshot without a second on-chain read. */
    wstETHToken: TokenInfo;
};

/** UniV2 add-liquidity from two budgets (LDO + streamed wstETH), LP to lpRecipient. */
export type LidoUniV2LiquidityDispatchStrategyNode = StrategyCommon & {
    kind: 'strategy.dispatch.lido.univ2-liquidity';
    /** Primary budget (full LDO). */
    budget: BudgetNode;
    /** Secondary budget (streamed wstETH). */
    budgetB: BudgetNode;
    router: Address;
    oracle: Address;
    epochProvider: EpochProviderNode;
    lpRecipient: Address;
    maxSlippageBps: number;
    maxStaleness: bigint;
    /** Last epoch this strategy fired (or attempted to). */
    lastEpoch: bigint;
};

/** CR's CowSwap strategy with a soft `PriceFloorGate` + once-per-epoch lockout. */
export type LidoGatedCowSwapDispatchStrategyNode = StrategyCommon & {
    kind: 'strategy.dispatch.lido.gated-cowswap';
    budget: BudgetNode;
    targetToken: TokenInfo;
    cowSwapSettlement: Address;
    priceOracle: Address;
    maxSlippageBps: bigint;
    maxStaleness: bigint;
    useSafeApproval: boolean;
    gate: PriceFloorGateNode;
    epochProvider: EpochProviderNode;
    lastEpoch: bigint;
};

export type UnknownStrategyNode = StrategyCommon & {
    kind: 'strategy.unknown';
    budget: BudgetNode | null; // best-effort read via IDispatchStrategy
};

// --- Budgets ----------------------------------------------------------------

export type BudgetNode =
    | FullBudgetNode
    | RequiredBudgetNode
    | LidoStreamUntilBudgetNode
    | UnknownBudgetNode;

type BudgetCommon = {
    address: Address;
    budgetId: string;
    token: TokenInfo;
};

export type FullBudgetNode = BudgetCommon & {
    kind: 'budget.full';
    vault: Address;
};

export type RequiredBudgetNode = BudgetCommon & {
    kind: 'budget.required';
    vault: Address;
    requiredAmount: bigint;
};

/** Operator-paced stream that targets a `targetEpoch` with a `floorEpochs` anti-spike floor. */
export type LidoStreamUntilBudgetNode = BudgetCommon & {
    kind: 'budget.lido.stream-until';
    vault: Address;
    epochProvider: EpochProviderNode;
    targetEpoch: bigint;
    floorEpochs: number;
};

export type UnknownBudgetNode = BudgetCommon & {
    kind: 'budget.unknown';
};

// --- Splitters --------------------------------------------------------------

export type SplitterNode =
    | SoloSplitterNode
    | EqualSplitterNode
    | RatioSplitterNode
    | UnknownSplitterNode;

type SplitterCommon = {
    address: Address;
    splitterId: string;
};

export type SoloSplitterNode = SplitterCommon & {
    kind: 'splitter.solo';
    recipient: Address;
};

export type EqualSplitterNode = SplitterCommon & {
    kind: 'splitter.equal';
    recipients: Address[];
};

export type RatioSplitterNode = SplitterCommon & {
    kind: 'splitter.ratio';
    /** Ratios are in parts-per-million (RATIO_BASE = 1_000_000). */
    entries: { recipient: Address; ratio: number }[];
};

export type UnknownSplitterNode = SplitterCommon & {
    kind: 'splitter.unknown';
};

// --- Gate (Lido-specific auxiliary node, not a CR splitter / budget) -------

export type PriceFloorGateNode = {
    kind: 'lido.price-floor-gate';
    address: Address;
    vault: Address;
    oracle: Address;
    tokenA: Address;
    tokenB: Address;
    threshold: bigint;
    maxStaleness: bigint;
};

// --- Epoch provider ---------------------------------------------------------

export type EpochProviderNode = {
    kind: 'epoch-provider';
    address: Address;
    currentEpoch: bigint;
};

// --- Union of any node kind (for registry keying, rendering) ----------------

export type AnyNode =
    | PluginNode
    | StrategyNode
    | BudgetNode
    | SplitterNode
    | EpochProviderNode
    | PriceFloorGateNode;

export type NodeKind = AnyNode['kind'];

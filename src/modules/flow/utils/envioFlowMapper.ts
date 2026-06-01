/**
 * Maps Envio indexer payloads (+ REST `/v2/policies` metadata) into the `IFlowDaoData` shape
 * the existing Flow dashboard components consume.
 *
 * Design notes:
 * - On-chain amounts are BigInt raw units. We normalise them to `number` using `token.decimals`
 *   exactly once (here) so downstream renderers keep using `number` like the mock.
 * - Fields the indexer doesn't provide (forecast, pending, full policy schema) are filled with
 *   best-effort defaults and clearly-marked placeholders so the UI doesn't lie.
 * - We prefer REST metadata (name, description, source.epochInterval, swap.targetToken) over
 *   synthesised values.
 * - Proposal attribution is layered on top via `proposalByTxHash` built in the provider from
 *   `useProposalList`, so the mapper stays free of governance-service coupling.
 * - Multi-dispatch policies are lifted into `orchestrators`: each run is reconstructed by
 *   grouping the child-policy executions that share the same `txHash` (multi-dispatch itself
 *   never emits `Dispatched`, only its sub-routers do).
 */

import type {
    IDaoPolicy,
    ILinkedAccountSummary,
} from '@/shared/api/daoService';
import {
    PolicyStrategySourceType,
    PolicyStrategyType,
} from '@/shared/api/daoService';
import type {
    EnvioEmbeddedStrategyKind,
    EnvioStrategyType,
    IEnvioExecutionTransfer,
    IEnvioPolicy,
    IEnvioPolicyEvent,
    IEnvioPolicyExecution,
    IEnvioRecipientAggregate,
    IEnvioStrategy,
    IFlowDaoDataResponse,
} from '@/shared/api/flowIndexer';
import type {
    FlowEmbeddedStrategyKind,
    FlowEventKind,
    FlowPolicyStatus,
    FlowPolicyStrategy,
    FlowTokenSymbol,
    IFlowCooldown,
    IFlowDao,
    IFlowDaoData,
    IFlowDispatch,
    IFlowEmbeddedStrategy,
    IFlowEvent,
    IFlowGroupedPolicies,
    IFlowOrchestrator,
    IFlowOrchestratorLeg,
    IFlowOrchestratorRun,
    IFlowPolicy,
    IFlowPolicySubRouter,
    IFlowRecipient,
    IFlowRecipientAggregate,
    IFlowSwapPair,
} from '../types';
import type { IFlowAddressBook } from './flowAddressBook';
import { EMPTY_FLOW_ADDRESS_BOOK } from './flowAddressBook';

const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toMillis = (seconds: string | number | null | undefined): number => {
    if (seconds == null) {
        return 0;
    }
    const n = typeof seconds === 'string' ? Number(seconds) : seconds;
    return Number.isFinite(n) ? n * 1000 : 0;
};

const isoFromSeconds = (seconds: string | number | null | undefined): string =>
    new Date(toMillis(seconds)).toISOString();

const shortenAddress = (addr: string): string =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

/**
 * Build an `IFlowRecipient` with the address book applied when possible, falling
 * back to the shortened address. Keeps the 3 call sites below in lock-step.
 */
const resolveRecipient = (
    addressBook: IFlowAddressBook,
    address: string,
    extras: Partial<Omit<IFlowRecipient, 'address' | 'name'>> = {},
): IFlowRecipient => {
    const known = addressBook.resolve(address);
    if (known) {
        return {
            address,
            name: known.label,
            ens: known.ens ?? undefined,
            role: known.role,
            ...extras,
        };
    }
    return {
        address,
        name: shortenAddress(address),
        ...extras,
    };
};

const BIG_ZERO = BigInt(0);
const BIG_TEN = BigInt(10);
const BIG_100 = BigInt(100);
const BIG_10000 = BigInt(10_000);

const normaliseAmount = (raw: string, decimals: number): number => {
    if (!raw) {
        return 0;
    }
    try {
        const big = BigInt(raw);
        if (decimals <= 0) {
            return Number(big);
        }
        // Avoid precision loss on huge bigints by splitting into int/frac.
        const base = BIG_TEN ** BigInt(decimals);
        const whole = Number(big / base);
        const frac = Number(big % base) / Number(base);
        return whole + frac;
    } catch {
        return 0;
    }
};

const STRATEGY_LABEL: Record<EnvioStrategyType, FlowPolicyStrategy> = {
    router: 'Router',
    burnRouter: 'Burn',
    claimer: 'Claimer',
    multiDispatch: 'Multi-dispatch',
    multiRouter: 'Multi-dispatch',
    multiClaimer: 'Multi-dispatch',
    uniswapRouter: 'Uniswap swap',
    cowSwapRouter: 'CoW swap',
    // LMM_DEMO_HACK: embedded strategies surface as Policy-level types on the
    // indexer side too (the orphan-strategy fallback path), so map them to the
    // closest end-user-friendly label.  Production traffic will not encounter
    // these — they always live inside a `multiDispatch` policy.
    wrapStrategy: 'Router',
    univ2LiquidityStrategy: 'Uniswap swap',
    gatedCowSwapStrategy: 'CoW swap',
    transferStrategy: 'Router',
    epochTransferStrategy: 'Stream',
    burnStrategy: 'Burn',
};

const STRATEGY_VERB: Record<EnvioStrategyType, string> = {
    router: 'dispatched',
    burnRouter: 'burnt',
    claimer: 'claimed',
    multiDispatch: 'dispatched',
    multiRouter: 'dispatched',
    multiClaimer: 'claimed',
    uniswapRouter: 'swapped',
    cowSwapRouter: 'swapped',
    wrapStrategy: 'wrapped',
    univ2LiquidityStrategy: 'added as liquidity',
    gatedCowSwapStrategy: 'swapped',
    transferStrategy: 'transferred',
    epochTransferStrategy: 'streamed',
    burnStrategy: 'burnt',
};

const EVENT_KIND: Record<IEnvioPolicyEvent['kind'], FlowEventKind> = {
    INSTALLED: 'policyInstalled',
    INITIALIZED: 'settingsUpdated',
    UNINSTALLED: 'policyUninstalled',
    SETTINGS_UPDATED: 'settingsUpdated',
    FAILSAFE_UPDATED: 'settingsUpdated',
    STRATEGY_FAILED: 'dispatchFailed',
    STRATEGY_PAUSED: 'paused',
    STRATEGY_UNPAUSED: 'resumed',
    TARGET_EPOCH_UPDATED: 'settingsUpdated',
    FLOOR_EPOCHS_UPDATED: 'settingsUpdated',
    EPOCH_LENGTH_UPDATED: 'settingsUpdated',
    GATE_THRESHOLD_UPDATED: 'settingsUpdated',
    GATE_STALENESS_UPDATED: 'settingsUpdated',
    COWSWAP_SETTINGS_UPDATED: 'settingsUpdated',
};

const EVENT_TITLE: Record<IEnvioPolicyEvent['kind'], string> = {
    INSTALLED: 'Policy installed',
    INITIALIZED: 'Policy initialized',
    UNINSTALLED: 'Policy uninstalled',
    SETTINGS_UPDATED: 'Settings updated',
    FAILSAFE_UPDATED: 'Failsafe map updated',
    STRATEGY_FAILED: 'Strategy failed',
    STRATEGY_PAUSED: 'Strategy paused',
    STRATEGY_UNPAUSED: 'Strategy unpaused',
    TARGET_EPOCH_UPDATED: 'Target epoch updated',
    FLOOR_EPOCHS_UPDATED: 'Floor epochs updated',
    EPOCH_LENGTH_UPDATED: 'Epoch length updated',
    GATE_THRESHOLD_UPDATED: 'Gate threshold updated',
    GATE_STALENESS_UPDATED: 'Gate staleness updated',
    COWSWAP_SETTINGS_UPDATED: 'CoW swap settings updated',
};

const isOrchestratorStrategyType = (type: EnvioStrategyType): boolean =>
    type === 'multiDispatch' ||
    type === 'multiRouter' ||
    type === 'multiClaimer';

const isSwapStrategyType = (type: EnvioStrategyType): boolean =>
    type === 'uniswapRouter' || type === 'cowSwapRouter';

// Sentinel "burn" destinations used across EVM ecosystems. A router whose
// dispatches go exclusively to one of these is semantically a burn router even
// if the indexer labelled its `strategyType` as plain `router` (e.g. installed
// from a generic repo with a BurnRouterStrategy).
const BURN_DESTINATIONS = new Set<string>([
    '0x0000000000000000000000000000000000000000',
    '0x000000000000000000000000000000000000dead',
]);

const isBurnAddress = (address: string | undefined | null): boolean =>
    !!address && BURN_DESTINATIONS.has(address.toLowerCase());

/**
 * Identifies routers whose dispatches effectively burn tokens even though the
 * indexer couldn't detect it upfront (plain `router` type with a burn
 * strategy). Requires at least one execution where the only outbound recipient
 * is a burn sentinel — we never upgrade the label speculatively when the
 * policy hasn't run yet.
 */
const detectEffectiveBurn = (envioPolicy: IEnvioPolicy): boolean => {
    if (envioPolicy.strategyType !== 'router') {
        return false;
    }
    const outboundRecipients = new Set<string>();
    for (const execution of envioPolicy.executions) {
        for (const transfer of execution.transfers) {
            if (!isOutboundTransfer(transfer)) {
                continue;
            }
            outboundRecipients.add(transfer.to.toLowerCase());
        }
    }
    if (outboundRecipients.size === 0) {
        return false;
    }
    for (const recipient of outboundRecipients) {
        if (!isBurnAddress(recipient)) {
            return false;
        }
    }
    return true;
};

// ---------------------------------------------------------------------------
// Proposal attribution
// ---------------------------------------------------------------------------

export interface IProposalAttribution {
    slug: string;
    proposalId: string;
    /**
     * Human-readable proposal title coming from the REST `/proposals` list
     * (`IProposal.title`). Used by the policy detail header to render a
     * meaningful pill instead of an opaque slug like
     * `plugin-0x…-7`. Falls back to the slug when missing.
     */
    title?: string;
}

export type ProposalByTxHash = ReadonlyMap<string, IProposalAttribution>;

const lookupProposal = (
    map: ProposalByTxHash | undefined,
    txHash: string | undefined,
): IProposalAttribution | undefined => {
    if (!map || !txHash) {
        return undefined;
    }
    return map.get(txHash.toLowerCase());
};

// ---------------------------------------------------------------------------
// Token / transfer aggregation
// ---------------------------------------------------------------------------

interface ITokenTotal {
    symbol: FlowTokenSymbol;
    decimals: number;
    amount: number;
    rawAmount: bigint;
}

/**
 * Filters out transfers that should never contribute to recipient-facing totals:
 * `unknown` opaque calls and `swapIn` internal legs (vault → swap router).
 */
// Internal legs that aren't real "money to recipient" moves.  Used to filter
// out approve/wrap/addLiquidity/swap-presign + Uniswap V3 pre-swap from the
// Recipients aggregate and from dispatch-amount math.
const INTERNAL_TRANSFER_KINDS: ReadonlySet<string> = new Set([
    'unknown',
    'swapIn',
    'wrap',
    'univ2AddLiquidity',
    'swapPresign',
    'approve',
]);

const isOutboundTransfer = (t: IEnvioExecutionTransfer): boolean =>
    !INTERNAL_TRANSFER_KINDS.has(t.decodedFrom);

const sumOutboundByToken = (
    transfers: readonly IEnvioExecutionTransfer[],
): Map<string, ITokenTotal> => {
    const byToken = new Map<string, ITokenTotal>();
    for (const t of transfers) {
        if (!isOutboundTransfer(t)) {
            continue;
        }
        const current = byToken.get(t.token.id) ?? {
            symbol: t.token.symbol,
            decimals: t.token.decimals,
            amount: 0,
            rawAmount: BIG_ZERO,
        };
        let asBig = BIG_ZERO;
        try {
            asBig = BigInt(t.amount);
        } catch {
            asBig = BIG_ZERO;
        }
        current.rawAmount += asBig;
        current.amount += normaliseAmount(t.amount, t.token.decimals);
        byToken.set(t.token.id, current);
    }
    return byToken;
};

/**
 * Returns the token that accounts for the most raw units across outbound transfers. For the
 * dashboard KPI view we pick a single "dominant" token per execution / policy so we can feed
 * the existing single-token `IFlowLastDispatch.amount + token` shape without inventing a
 * multi-token UI.
 */
const pickDominantOutboundToken = (
    transfers: readonly IEnvioExecutionTransfer[],
): ITokenTotal | null => {
    const byToken = sumOutboundByToken(transfers);
    let best: ITokenTotal | null = null;
    for (const entry of byToken.values()) {
        if (!best || entry.rawAmount > best.rawAmount) {
            best = entry;
        }
    }
    return best;
};

interface IPrimarySwapOrder {
    sellSymbol: FlowTokenSymbol;
    buySymbol: FlowTokenSymbol;
    sellAmountNum: number;
    buyAmountNum: number;
}

/**
 * Picks the "primary" CowSwap order for an execution.  In practice every
 * GatedCowSwap dispatch emits exactly one CowSwapOrderPosted event, so we
 * grab the first one we see.  Returns null when no orders are attached.
 */
const pickPrimarySwapOrder = (
    swapOrders: IEnvioPolicyExecution['swapOrders'],
): IPrimarySwapOrder | null => {
    if (!swapOrders || swapOrders.length === 0) {
        return null;
    }
    const order = swapOrders[0];
    return {
        sellSymbol: order.sellToken.symbol as FlowTokenSymbol,
        buySymbol: order.buyToken.symbol as FlowTokenSymbol,
        sellAmountNum: normaliseAmount(
            order.sellAmount,
            order.sellToken.decimals,
        ),
        buyAmountNum: normaliseAmount(order.buyAmount, order.buyToken.decimals),
    };
};

const pickSwapInLeg = (
    transfers: readonly IEnvioExecutionTransfer[],
): { symbol: FlowTokenSymbol; amount: number } | null => {
    let totalAmount = 0;
    let symbol: FlowTokenSymbol | null = null;
    let decimals = 0;
    for (const t of transfers) {
        if (t.decodedFrom !== 'swapIn') {
            continue;
        }
        symbol = t.token.symbol;
        decimals = t.token.decimals;
        totalAmount += normaliseAmount(t.amount, decimals);
    }
    if (symbol == null) {
        return null;
    }
    return { symbol, amount: totalAmount };
};

/**
 * "Leg-input" headline picker for orchestrator strategies (Lido Money
 * Machine and similar).  When a leg only emits internal actions —
 * `wrap`, `univ2AddLiquidity`, `swapPresign` — there are no outbound
 * transfers to surface as the dispatch headline.  Falling back to
 * "0 USDC" in that case is the existing bug we're fixing; instead,
 * pick the dominant (largest-raw-amount) internal transfer and treat
 * its token/amount as the headline so History rows read
 * "100 stETH · Wrap leg" instead of "0 USDC · 2 recipients".
 *
 * Skips `approve` (allowance, not consumption) and `swapPresign`
 * (CowSwap orders carry sell/buy amounts on `SwapOrder`, picked up by
 * the cowOrder branch already).  Returns null when no eligible
 * internal transfer is found — the caller keeps its existing fallback.
 */
const LEG_INPUT_KINDS: ReadonlySet<string> = new Set([
    'wrap',
    'univ2AddLiquidity',
]);

/**
 * Sum every leg-input transfer (wrap, univ2AddLiquidity) across all
 * executions of an orchestrator policy where the token symbol matches
 * `headlineSymbol`.  Used to compute the orchestrator's "X stETH ran
 * through the machine" KPI without conflating units (we'd otherwise
 * be summing stETH + wstETH + LDO together).
 */
const sumLegInputForSymbol = (
    policy: IEnvioPolicy,
    headlineSymbol: FlowTokenSymbol,
): number => {
    let total = 0;
    for (const execution of policy.executions) {
        for (const t of execution.transfers) {
            if (!LEG_INPUT_KINDS.has(t.decodedFrom)) {
                continue;
            }
            if (t.token.symbol !== headlineSymbol) {
                continue;
            }
            total += normaliseAmount(t.amount, t.token.decimals);
        }
    }
    return total;
};

const pickLegInputTransfer = (
    transfers: readonly IEnvioExecutionTransfer[],
): ITokenTotal | null => {
    const byToken = new Map<string, ITokenTotal>();
    for (const t of transfers) {
        if (!LEG_INPUT_KINDS.has(t.decodedFrom)) {
            continue;
        }
        const current = byToken.get(t.token.id) ?? {
            symbol: t.token.symbol,
            decimals: t.token.decimals,
            amount: 0,
            rawAmount: BIG_ZERO,
        };
        let asBig = BIG_ZERO;
        try {
            asBig = BigInt(t.amount);
        } catch {
            asBig = BIG_ZERO;
        }
        current.rawAmount += asBig;
        current.amount += normaliseAmount(t.amount, t.token.decimals);
        byToken.set(t.token.id, current);
    }
    let best: ITokenTotal | null = null;
    for (const entry of byToken.values()) {
        if (!best || entry.rawAmount > best.rawAmount) {
            best = entry;
        }
    }
    return best;
};

// ---------------------------------------------------------------------------
// Orchestrator (multi-dispatch) currency
// ---------------------------------------------------------------------------

/**
 * Best-effort guess for the orchestrator's "headline currency" — the token
 * the user thinks the machine is *moving*, not the dominant outbound token of
 * any one leg.  Used to label the chart on an orchestrator policy detail page
 * so a never-dispatched LMM-style chain doesn't render "0 USDC" by default.
 *
 * Today this only handles leg-0 = WRAP, where the answer is mechanically
 * fixed: a wstETH-output wrap strategy unwraps stETH (the Lido wstETH /
 * stETH pair is the only deployed wrap target).  Other leg-0 kinds would
 * need the budget's underlying ERC-20 symbol, which is not exposed by the
 * indexer's `Budget` entity today — those fall through to the caller's
 * existing dominant-outbound heuristic.
 *
 * When the strategy set grows beyond Lido we should either (a) extend the
 * indexer schema with `Budget.token`, or (b) parse a richer `configJson`
 * with an explicit `inputToken` field on every strategy.
 */
const pickOrchestratorInputToken = (
    envioPolicy: IEnvioPolicy,
): FlowTokenSymbol | undefined => {
    const sortedStrategies = (envioPolicy.strategies ?? [])
        .filter((s) => s.index != null)
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    const leg0 = sortedStrategies[0] ?? envioPolicy.strategies?.[0];
    if (!leg0) {
        return undefined;
    }

    if (leg0.kind === 'WRAP') {
        // configJson shape from capital-flow-indexer/src/multiDispatchBackfill.ts:
        //   { wstETH: '0x...' } — the OUTPUT.  Input is the underlying.
        // Lido wstETH is the only on-chain wrap target Capital Router supports
        // today; its underlying is stETH.  We don't need to inspect the
        // address because there's no ambiguity yet.
        return 'stETH' as FlowTokenSymbol;
    }

    // UNIV2_LIQUIDITY / GATED_COWSWAP / TRANSFER / EPOCH_TRANSFER / BURN /
    // UNKNOWN — input lives on the budget contract; not in Hasura yet.
    return undefined;
};

// ---------------------------------------------------------------------------
// Executions → IFlowDispatch
// ---------------------------------------------------------------------------

const buildTopRecipients = (
    execution: IEnvioPolicyExecution,
    addressBook: IFlowAddressBook,
): IFlowRecipient[] => {
    const seen = new Map<string, IFlowRecipient>();
    for (const transfer of execution.transfers) {
        if (!isOutboundTransfer(transfer)) {
            continue;
        }
        if (seen.has(transfer.to)) {
            continue;
        }
        seen.set(transfer.to, resolveRecipient(addressBook, transfer.to));
        if (seen.size >= 3) {
            break;
        }
    }
    return Array.from(seen.values());
};

const mapExecutionToDispatch = (
    execution: IEnvioPolicyExecution,
    addressBook: IFlowAddressBook,
    strategyType: EnvioStrategyType,
    fallbackOutSymbol: FlowTokenSymbol | undefined,
    proposalMap: ProposalByTxHash | undefined,
): IFlowDispatch => {
    const dominantOut = pickDominantOutboundToken(execution.transfers);
    const swapIn = pickSwapInLeg(execution.transfers);
    const uniqueRecipients = new Set(
        execution.transfers.filter(isOutboundTransfer).map((t) => t.to),
    );
    const proposal = lookupProposal(proposalMap, execution.txHash);

    // CowSwap swap orders posted in the same execution.  When present, prefer
    // them as the authoritative source of IN/OUT amounts — the dispatcher's
    // calldata only sees the IGPv2Settlement.setPreSignature, not the actual
    // sell/buy legs.  We aggregate over all orders in the execution (in
    // practice there's exactly one per dispatch for the demo).
    const cowOrder = pickPrimarySwapOrder(execution.swapOrders);

    // Swap strategies: OUT transfers come from the AMM pool (not our calldata)
    // so the indexer can't see them. We surface the IN leg as the dispatch's
    // primary amount/token — it's the only number we actually know — and keep
    // the REST-derived OUT symbol as a display-only chip so the card still
    // reads "X WETH → MERC" rather than "0 USDC".
    const isSwap = isSwapStrategyType(strategyType);

    // Multi-dispatch leg context — `execution.strategy.kind` carries the
    // sub-strategy kind (WRAP / UNIV2_LIQUIDITY / GATED_COWSWAP / …), and
    // `execution.strategyIndex` is its position in the orchestrator's
    // strategy list.  Both null for legacy single-dispatch routers; the
    // consumer treats absence as "no leg context, render normally".
    const legIndex =
        execution.strategyIndex != null && execution.strategyIndex >= 0
            ? execution.strategyIndex
            : undefined;
    const legKind = execution.strategy?.kind;

    if (cowOrder) {
        return {
            id: execution.id,
            at: isoFromSeconds(execution.blockTimestamp),
            amount: cowOrder.sellAmountNum,
            token: cowOrder.sellSymbol,
            amountIn: cowOrder.sellAmountNum,
            tokenIn: cowOrder.sellSymbol,
            amountOut: cowOrder.buyAmountNum,
            tokenOut: cowOrder.buySymbol ?? fallbackOutSymbol,
            recipientsCount: uniqueRecipients.size || execution.transferCount,
            topRecipients: buildTopRecipients(execution, addressBook),
            txHash: execution.txHash,
            proposalId: proposal?.proposalId,
            proposalSlug: proposal?.slug,
            // Surface skip/skippedReason on the dispatch shape so the chart
            // can render a "skipped" marker.  IFlowDispatch is extended in
            // ../types to carry these optional fields.
            status: execution.skipped ? 'skipped' : 'ok',
            skippedReason: execution.skippedReason ?? undefined,
            legIndex,
            legKind,
        };
    }

    if (isSwap && swapIn) {
        return {
            id: execution.id,
            at: isoFromSeconds(execution.blockTimestamp),
            amount: swapIn.amount,
            token: swapIn.symbol,
            amountIn: swapIn.amount,
            tokenIn: swapIn.symbol,
            amountOut: dominantOut?.amount,
            tokenOut:
                (dominantOut?.symbol as FlowTokenSymbol) ?? fallbackOutSymbol,
            recipientsCount: uniqueRecipients.size || execution.transferCount,
            topRecipients: buildTopRecipients(execution, addressBook),
            txHash: execution.txHash,
            proposalId: proposal?.proposalId,
            proposalSlug: proposal?.slug,
            legIndex,
            legKind,
        };
    }

    // Orchestrator leg fallback: no outbound transfer, no cowOrder, no
    // swap-in — but there may still be a `wrap` / `univ2AddLiquidity`
    // transfer carrying the leg's input amount.  Without this branch the
    // history row falls back to "0 USDC" for every Wrap and UniV2 leg of
    // the LMM dispatcher.  See `pickLegInputTransfer` for the picker.
    //
    // NOTE: we deliberately DO NOT populate `tokenIn`/`amountIn` here.
    // The chart treats `tokenIn != null && amountIn != null` as the
    // "swap dispatch" sigil — surfacing the leg-input under those keys
    // would mislabel every wrap/LP dispatch as a Uniswap-style swap on
    // the timeline.  The leg-input *is* the headline amount for the row,
    // so `amount` + `token` carry it on their own.
    const legInput = pickLegInputTransfer(execution.transfers);
    if (legInput) {
        return {
            id: execution.id,
            at: isoFromSeconds(execution.blockTimestamp),
            amount: legInput.amount,
            token: legInput.symbol,
            // Recipients aren't meaningful for these legs — the produced
            // tokens land back on the vault, not on an external address.
            // Show 0 so the History description says "No recipients" rather
            // than echoing the action count.
            recipientsCount: 0,
            topRecipients: [],
            txHash: execution.txHash,
            proposalId: proposal?.proposalId,
            proposalSlug: proposal?.slug,
            status: execution.skipped ? 'skipped' : 'ok',
            skippedReason: execution.skippedReason ?? undefined,
            legIndex,
            legKind,
        };
    }

    // CowSwap-style leg that ran successfully but produced no SwapOrder
    // entity yet (either the on-chain `CowSwapOrderPosted` event hasn't
    // been ingested, or this is a `setPreSignature(false)` cancellation).
    if (legKind === 'GATED_COWSWAP' || legKind === 'COWSWAP') {
        // Best-effort sellAmount for the destinations + history rows when
        // the `SwapOrder` join is missing.  The dispatch's calldata always
        // contains an `ERC20.approve(wstETH, relayer, sellAmount)` (the
        // dispatcher needs to grant the relayer allowance before the
        // pre-sign), and `setPreSignature(orderUid, signed)` itself.  The
        // indexer decodes the approve into a transfer with
        // `decodedFrom = 'approve'` carrying the *actual* sellAmount,
        // while `swapPresign` is just a marker (amount = 0n by design —
        // see capital-flow-indexer/src/actionDecoder.ts setPreSignature
        // branch).  Pick the largest non-zero `approve` — `useSafeApproval`
        // emits two approves per dispatch, the first to 0, then to
        // sellAmount, so picking the max ignores the reset hop.
        const approves = execution.transfers.filter(
            (t) => t.decodedFrom === 'approve',
        );
        let bestApprove: { amount: number; symbol: string } | null = null;
        for (const t of approves) {
            const v = normaliseAmount(t.amount, t.token.decimals);
            if (v > 0 && (bestApprove == null || v > bestApprove.amount)) {
                bestApprove = { amount: v, symbol: t.token.symbol };
            }
        }
        if (bestApprove != null) {
            return {
                id: execution.id,
                at: isoFromSeconds(execution.blockTimestamp),
                amount: bestApprove.amount,
                token: bestApprove.symbol as FlowTokenSymbol,
                amountIn: bestApprove.amount,
                tokenIn: bestApprove.symbol as FlowTokenSymbol,
                recipientsCount: 0,
                topRecipients: [],
                txHash: execution.txHash,
                proposalId: proposal?.proposalId,
                proposalSlug: proposal?.slug,
                status: execution.skipped ? 'skipped' : 'ok',
                skippedReason: execution.skippedReason ?? undefined,
                legIndex,
                legKind,
            };
        }
        return {
            id: execution.id,
            at: isoFromSeconds(execution.blockTimestamp),
            // `0` + empty token string is the agreed sentinel — UI checks
            // `dispatch.token === ''` to suppress the amount + chip block
            // for "pre-signed without a fill" rows.
            amount: 0,
            token: '' as FlowTokenSymbol,
            recipientsCount: 0,
            topRecipients: [],
            txHash: execution.txHash,
            proposalId: proposal?.proposalId,
            proposalSlug: proposal?.slug,
            status: execution.skipped ? 'skipped' : 'ok',
            skippedReason: execution.skippedReason ?? undefined,
            legIndex,
            legKind,
        };
    }

    const tokenOut =
        (dominantOut?.symbol as FlowTokenSymbol) ?? ('USDC' as FlowTokenSymbol);
    return {
        id: execution.id,
        at: isoFromSeconds(execution.blockTimestamp),
        amount: dominantOut?.amount ?? 0,
        token: tokenOut,
        amountIn: swapIn?.amount,
        tokenIn: swapIn?.symbol,
        recipientsCount: uniqueRecipients.size || execution.transferCount,
        topRecipients: buildTopRecipients(execution, addressBook),
        txHash: execution.txHash,
        proposalId: proposal?.proposalId,
        proposalSlug: proposal?.slug,
        legIndex,
        legKind,
    };
};

// ---------------------------------------------------------------------------
// Status derivation
// ---------------------------------------------------------------------------

const deriveStatus = (
    policy: IEnvioPolicy,
    cooldown: IFlowCooldown | null,
    recentFailure: boolean,
): { status: FlowPolicyStatus; statusLabel: string } => {
    if (policy.status === 'UNINSTALLED') {
        return { status: 'paused', statusLabel: 'Uninstalled' };
    }
    if (policy.totalDispatches === '0' || !policy.lastDispatchAt) {
        return {
            status: 'never',
            statusLabel: recentFailure
                ? 'Awaiting review · last dispatch failed'
                : 'Never dispatched',
        };
    }
    if (recentFailure) {
        return {
            status: 'awaiting',
            statusLabel: 'Awaiting review · last dispatch failed',
        };
    }
    if (cooldown) {
        const readyMs = new Date(cooldown.readyAt).getTime();
        if (readyMs > Date.now()) {
            return {
                status: 'cooldown',
                statusLabel: 'Cooldown · awaiting next epoch',
            };
        }
        return { status: 'ready', statusLabel: 'Ready to dispatch' };
    }
    return { status: 'live', statusLabel: 'Live' };
};

// ---------------------------------------------------------------------------
// Cooldown (streams) — uses REST.epochInterval + Envio.lastDispatchAt
// ---------------------------------------------------------------------------

const deriveCooldown = (
    policy: IEnvioPolicy,
    restPolicy: IDaoPolicy | undefined,
): IFlowCooldown | null => {
    if (!policy.lastDispatchAt) {
        return null;
    }

    // 1. Preferred: derive from StreamUntilBudget on one of the embedded
    //    strategies.  The dispatcher's "next firing time" is bounded by the
    //    fastest stream — pick the smallest epochLength × floorEpochs.
    const streamCooldown = deriveStreamCooldownFromStrategies(policy);
    if (streamCooldown) {
        return streamCooldown;
    }

    // 2. Fallback: legacy REST-driven cooldown for single-dispatch routers
    //    whose policy.strategy.source carries the streamBalance metadata.
    if (
        restPolicy?.strategy.source?.type !==
        PolicyStrategySourceType.STREAM_BALANCE
    ) {
        return null;
    }
    const epochSeconds = restPolicy.strategy.source.epochInterval;
    if (!epochSeconds) {
        return null;
    }
    const readyAtMs = toMillis(policy.lastDispatchAt) + epochSeconds * 1000;
    return {
        readyAt: new Date(readyAtMs).toISOString(),
        totalMs: epochSeconds * 1000,
    };
};

const deriveStreamCooldownFromStrategies = (
    policy: IEnvioPolicy,
): IFlowCooldown | null => {
    const strategies = policy.strategies;
    if (!strategies || strategies.length === 0 || !policy.lastDispatchAt) {
        return null;
    }
    let bestSeconds: number | undefined;
    for (const s of strategies) {
        const budget = s.budget;
        const epochProvider = s.epochProvider;
        if (!budget || budget.kind !== 'STREAM_UNTIL') {
            continue;
        }
        if (!epochProvider?.epochLength) {
            continue;
        }
        const epochLength = Number(epochProvider.epochLength);
        const floorEpochs = budget.floorEpochs ? Number(budget.floorEpochs) : 1;
        if (!Number.isFinite(epochLength) || epochLength <= 0) {
            continue;
        }
        const cooldownSeconds = epochLength * Math.max(1, floorEpochs);
        if (bestSeconds == null || cooldownSeconds < bestSeconds) {
            bestSeconds = cooldownSeconds;
        }
    }
    if (bestSeconds == null) {
        return null;
    }
    const readyAtMs = toMillis(policy.lastDispatchAt) + bestSeconds * 1000;
    return {
        readyAt: new Date(readyAtMs).toISOString(),
        totalMs: bestSeconds * 1000,
    };
};

// ---------------------------------------------------------------------------
// Swap pair (REST metadata → chip)
// ---------------------------------------------------------------------------

const deriveSwapPair = (
    envioPolicy: IEnvioPolicy,
    restPolicy: IDaoPolicy | undefined,
): IFlowSwapPair | undefined => {
    if (!isSwapStrategyType(envioPolicy.strategyType)) {
        return undefined;
    }

    // Prefer REST metadata — it always reports the configured source/target, even for
    // never-run policies that have no execution data yet.
    const restIn = restPolicy?.strategy.source?.token?.symbol;
    const restOut = restPolicy?.strategy.swap?.targetToken?.symbol;
    if (restIn && restOut) {
        return { in: restIn, out: restOut };
    }

    // Fall back to the latest execution — handy when REST metadata is missing or stale.
    const latest =
        envioPolicy.lastExecution ?? envioPolicy.executions[0] ?? null;
    if (!latest) {
        return undefined;
    }
    const out = pickDominantOutboundToken(latest.transfers)?.symbol;
    const inLeg = pickSwapInLeg(latest.transfers)?.symbol;
    if (!out || !inLeg) {
        return undefined;
    }
    return { in: inLeg, out };
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

const mapEvent = (
    event: IEnvioPolicyEvent,
    proposalMap: ProposalByTxHash | undefined,
): IFlowEvent => {
    const attribution = lookupProposal(proposalMap, event.txHash);
    return {
        id: event.id,
        kind: EVENT_KIND[event.kind] ?? 'settingsUpdated',
        at: isoFromSeconds(event.blockTimestamp),
        title: EVENT_TITLE[event.kind] ?? 'Policy event',
        description: event.description,
        txHash: event.txHash,
        proposalId: attribution?.proposalId,
        proposalSlug: attribution?.slug,
    };
};

// ---------------------------------------------------------------------------
// Policy
// ---------------------------------------------------------------------------

const strategyLong = (
    type: EnvioStrategyType,
    restPolicy: IDaoPolicy | undefined,
): string => {
    const base = STRATEGY_LABEL[type];
    const source = restPolicy?.strategy.source;
    if (
        source?.type === PolicyStrategySourceType.STREAM_BALANCE &&
        source.epochInterval
    ) {
        const days = Math.round(source.epochInterval / 86_400);
        return `${base} · ${days}d epoch`;
    }
    return base;
};

const buildPolicyRecipients = (
    recipientAggregates: readonly IEnvioRecipientAggregate[],
    policyId: string,
    addressBook: IFlowAddressBook,
): IFlowRecipient[] => {
    const forPolicy = recipientAggregates.filter(
        (r) => r.policy.id === policyId,
    );
    if (forPolicy.length === 0) {
        return [];
    }

    // Pick the dominant token for this policy so pct labels make sense, then compute shares.
    const totalsByToken = new Map<string, bigint>();
    for (const r of forPolicy) {
        try {
            totalsByToken.set(
                r.token.id,
                (totalsByToken.get(r.token.id) ?? BIG_ZERO) +
                    BigInt(r.totalAmount),
            );
        } catch {
            /* skip unparseable */
        }
    }
    let dominantTokenId: string | null = null;
    let dominantTotal = BIG_ZERO;
    for (const [id, total] of totalsByToken.entries()) {
        if (total > dominantTotal) {
            dominantTotal = total;
            dominantTokenId = id;
        }
    }
    if (!dominantTokenId || dominantTotal === BIG_ZERO) {
        return [];
    }

    const forDominant = forPolicy
        .filter((r) => r.token.id === dominantTokenId)
        .sort((a, b) => {
            try {
                return Number(BigInt(b.totalAmount) - BigInt(a.totalAmount));
            } catch {
                return 0;
            }
        })
        .slice(0, 6);

    return forDominant.map((r) => {
        let pct: number | undefined;
        try {
            pct =
                Number((BigInt(r.totalAmount) * BIG_10000) / dominantTotal) /
                Number(BIG_100);
        } catch {
            pct = undefined;
        }
        return resolveRecipient(addressBook, r.recipient, { pct });
    });
};

const mapPolicy = (params: {
    envioPolicy: IEnvioPolicy;
    restPolicy: IDaoPolicy | undefined;
    recipientAggregates: readonly IEnvioRecipientAggregate[];
    proposalByTxHash: ProposalByTxHash | undefined;
    addressBook: IFlowAddressBook;
}): IFlowPolicy => {
    const {
        envioPolicy,
        restPolicy,
        recipientAggregates,
        proposalByTxHash,
        addressBook,
    } = params;
    const strategyType = envioPolicy.strategyType;
    const isSwap = isSwapStrategyType(strategyType);

    const recipients = buildPolicyRecipients(
        recipientAggregates,
        envioPolicy.id,
        addressBook,
    );

    // Effective-burn heuristic: the indexer reports `strategyType: 'router'` for
    // routers installed from generic repos even when every dispatch feeds a
    // burn destination. Treat such routers as "Burn" so overview chips stop
    // saying "Router" for what is semantically a burn.
    const effectiveStrategyType = detectEffectiveBurn(envioPolicy)
        ? ('burnRouter' as EnvioStrategyType)
        : strategyType;

    const swapPair = deriveSwapPair(envioPolicy, restPolicy);
    const restOutSymbol = restPolicy?.strategy.swap?.targetToken?.symbol as
        | FlowTokenSymbol
        | undefined;

    // Aggregate totals across ALL executions for "total distributed", ignoring unknown
    // transfers. Swap-noise (`swapIn`) is also excluded so Total = OUT-side only,
    // EXCEPT for swap strategies where OUT transfers aren't indexable (Uniswap
    // pools settle tokens via internal accounting, not via the calldata we
    // decode). For swaps we fall back to the IN leg sum so the card stops
    // reading "0 USDC" when there clearly have been swaps.
    const allTransfers = envioPolicy.executions.flatMap((e) => e.transfers);
    const dominantAll = pickDominantOutboundToken(allTransfers);
    const swapInAll = pickSwapInLeg(allTransfers);
    const lastExecution =
        envioPolicy.lastExecution ?? envioPolicy.executions[0] ?? null;
    const dominantLast = lastExecution
        ? pickDominantOutboundToken(lastExecution.transfers)
        : null;
    const swapInLast = lastExecution
        ? pickSwapInLeg(lastExecution.transfers)
        : null;

    // For orchestrator (multi-dispatch) policies, prefer the headline input
    // token of leg 0 over the dominant-outbound heuristic.  The latter picks
    // the largest outbound transfer across all legs (e.g. wstETH after a
    // WRAP), which is misleading on a "Lido Money Machine"-style chain where
    // the user thinks of the machine as a stETH pipeline.  Empty for non-
    // orchestrators and for orchestrators we can't classify yet — both fall
    // through to the existing dominant logic + USDC tail fallback.
    const orchestratorToken = isOrchestratorStrategyType(strategyType)
        ? pickOrchestratorInputToken(envioPolicy)
        : undefined;

    const policyToken =
        orchestratorToken ??
        (isSwap && dominantAll == null
            ? ((swapInAll?.symbol as FlowTokenSymbol) ??
              (swapPair?.in as FlowTokenSymbol) ??
              ('USDC' as FlowTokenSymbol))
            : ((dominantAll?.symbol as FlowTokenSymbol) ??
              (dominantLast?.symbol as FlowTokenSymbol) ??
              ('USDC' as FlowTokenSymbol)));

    // Orchestrator (multi-dispatch) total: there are no outbound transfers
    // we can dominant-sum across (every leg's tokens stay internal to the
    // pipeline), so fall back to summing the "leg-input" transfers for the
    // headline token only — e.g. for LMM that's the stETH consumed by the
    // Wrap leg across every dispatch.  Mixing wstETH/LDO amounts into the
    // same headline would conflate units, so we keep it strictly to the
    // token chosen by `pickOrchestratorInputToken`.
    const isOrchestrator = isOrchestratorStrategyType(strategyType);
    const orchestratorHeadlineTotal = isOrchestrator
        ? sumLegInputForSymbol(envioPolicy, policyToken)
        : 0;

    const policyTotalDistributed = isOrchestrator
        ? orchestratorHeadlineTotal
        : isSwap && dominantAll == null
          ? (swapInAll?.amount ?? 0)
          : (dominantAll?.amount ?? 0);

    const cooldown = deriveCooldown(envioPolicy, restPolicy);
    const dispatches = envioPolicy.executions.map((execution) =>
        mapExecutionToDispatch(
            execution,
            addressBook,
            strategyType,
            restOutSymbol,
            proposalByTxHash,
        ),
    );
    // LMM_DEMO_HACK: synthetic-policy-installed.  The indexer's `INSTALLED`
    // event is emitted by the `PolicyInstalled` topic, but the LMM dispatcher
    // plugin replays a custom `Initialized` topic on first deploy and the
    // current `capital-flow-indexer` registers only one of the two — so the
    // chart loses its leftmost lifecycle marker whenever any other event
    // (e.g. `STRATEGY_PAUSED`) lands first.  We always inject a synthetic
    // `policyInstalled` row here so the chart and history always carry the
    // install marker, regardless of which other events accompanied it.
    // Production replacement: emit a canonical `INSTALLED` row from the
    // indexer for every plugin install — see lido-mmd-status.md
    // `synthetic-policy-installed`.
    const mappedEvents = envioPolicy.events.map((e) =>
        mapEvent(e, proposalByTxHash),
    );
    const hasInstalledEvent = mappedEvents.some(
        (e) => e.kind === 'policyInstalled',
    );
    const events: IFlowEvent[] = hasInstalledEvent
        ? mappedEvents
        : [
              ...mappedEvents,
              {
                  id: `${envioPolicy.id}-installed`,
                  kind: 'policyInstalled' as FlowEventKind,
                  at: isoFromSeconds(envioPolicy.installedAt),
                  title: 'Policy installed',
                  description: `Installed at block ${envioPolicy.installBlockNumber}.`,
                  txHash: envioPolicy.installTxHash,
                  proposalId: lookupProposal(
                      proposalByTxHash,
                      envioPolicy.installTxHash,
                  )?.proposalId,
                  proposalSlug: lookupProposal(
                      proposalByTxHash,
                      envioPolicy.installTxHash,
                  )?.slug,
              },
          ];
    // The current on-chain plugin ABI doesn't emit dedicated failure events, so we have no
    // real-time signal for a failed dispatch. Keep the hook for future failure events.
    const recentFailure = false;
    const { status, statusLabel } = deriveStatus(
        envioPolicy,
        cooldown,
        recentFailure,
    );

    const nextDispatchAt = cooldown?.readyAt;
    const nextDispatchLabel = cooldown
        ? `Streams · next at ${new Date(cooldown.readyAt).toLocaleDateString()}`
        : status === 'never'
          ? 'Not yet dispatched'
          : 'Pull-based';

    const installTxHash = envioPolicy.installTxHash;
    const installAttribution = lookupProposal(proposalByTxHash, installTxHash);
    const uninstallEvent = envioPolicy.events.find(
        (e) => e.kind === 'UNINSTALLED',
    );
    const uninstalledAt = uninstallEvent
        ? isoFromSeconds(uninstallEvent.blockTimestamp)
        : undefined;

    const address = envioPolicy.pluginAddress.toLowerCase();

    // For swap strategies the OUT leg is opaque, so "last dispatch" should quote
    // the IN leg rather than a spurious 0 in the declared target token.
    const lastDispatchAmount =
        isSwap && dominantLast == null
            ? (swapInLast?.amount ?? 0)
            : (dominantLast?.amount ?? 0);
    const lastDispatchToken =
        isSwap && dominantLast == null
            ? ((swapInLast?.symbol as FlowTokenSymbol) ?? policyToken)
            : ((dominantLast?.symbol as FlowTokenSymbol) ?? policyToken);

    return {
        id: envioPolicy.id,
        address,
        name:
            restPolicy?.name ??
            `Policy ${shortenAddress(envioPolicy.pluginAddress)}`,
        description:
            restPolicy?.description ??
            `${STRATEGY_LABEL[effectiveStrategyType]} plugin installed on ${shortenAddress(envioPolicy.dao.address)}.`,
        strategy: STRATEGY_LABEL[effectiveStrategyType],
        strategyLong: strategyLong(effectiveStrategyType, restPolicy),
        token: policyToken,
        swapPair,
        status,
        statusLabel,
        verb: STRATEGY_VERB[effectiveStrategyType],
        createdAt: isoFromSeconds(envioPolicy.installedAt),
        installedViaProposal: installAttribution?.proposalId ?? '—',
        installedViaProposalId: installAttribution?.proposalId,
        installedViaProposalSlug: installAttribution?.slug,
        installedViaProposalTitle: installAttribution?.title,
        installTxHash,
        uninstalledAt,
        totalDistributed: policyTotalDistributed,
        forecast30d: 0,
        nextDispatchLabel,
        nextDispatchAt,
        pending: null,
        cooldown,
        lastDispatch: lastExecution
            ? {
                  amount: lastDispatchAmount,
                  token: lastDispatchToken,
                  at: isoFromSeconds(lastExecution.blockTimestamp),
                  txHash: lastExecution.txHash,
                  recipientsCount: new Set(
                      lastExecution.transfers
                          .filter(isOutboundTransfer)
                          .map((t) => t.to),
                  ).size,
              }
            : undefined,
        recipients,
        recipientsMore: Math.max(
            0,
            recipientAggregates.filter((r) => r.policy.id === envioPolicy.id)
                .length - recipients.length,
        ),
        recipientGroup:
            recipients.length > 0
                ? `Recipients (${recipients.length})`
                : 'No recipients yet',
        dispatches,
        events,
        schema: {
            source: restPolicy?.strategy.source?.type ?? '—',
            allowance: {
                type: restPolicy?.strategy.source?.type ?? '—',
                detail:
                    restPolicy?.strategy.source?.type ===
                    PolicyStrategySourceType.STREAM_BALANCE
                        ? `Stream · epoch ${restPolicy.strategy.source.epochInterval}s`
                        : '—',
            },
            model: {
                type: restPolicy?.strategy.model?.type ?? '—',
                detail: '—',
            },
            recipients: recipients.map((r, i) => ({
                ...r,
                ratio:
                    typeof r.pct === 'number'
                        ? `${r.pct.toFixed(1)}%`
                        : `slot ${i + 1}`,
            })),
            // Multi-dispatch orchestrators are rendered through `FlowPolicyStructure`
            // → `FlowPolicyTree`, which short-circuits to `LmmPolicyTopology` for the
            // demo dispatcher (driven by `useLmmManifest`, not by this array).  But
            // `FlowPolicyStructure` still gates rendering on `subRouters != null`,
            // so we have to surface a non-null array for orchestrators — empty is
            // fine since the topology view derives its graph from `inspect()`.
            // For pre-LMM orchestrators (multiRouter / multiClaimer) we still
            // honour whatever the REST policy declared.
            subRouters: isOrchestratorStrategyType(strategyType)
                ? buildSubRouterStubs(envioPolicy, restPolicy)
                : undefined,
        },
    };
};

/**
 * Lightweight `IFlowPolicySubRouter[]` builder for orchestrator policies.
 * Prefers REST `strategy.subRouters` (the legacy multi-router shape — addresses
 * point at sibling Policy entities) and falls back to envio `Policy.strategies`
 * (the LMM embedded shape — addresses point at sub-contracts that are NOT
 * separately installed via PSP).  Either way every entry has at least an `id`
 * + a `title`, which is enough for the SVG tree fallback; the rich topology
 * view (`LmmPolicyTopology`) builds its own nodes from on-chain `inspect()`.
 */
const buildSubRouterStubs = (
    envioPolicy: IEnvioPolicy,
    restPolicy: IDaoPolicy | undefined,
): IFlowPolicySubRouter[] => {
    const restSubRouters = restPolicy?.strategy.subRouters ?? [];
    if (restSubRouters.length > 0) {
        return restSubRouters.map((address) => ({
            id: address.toLowerCase(),
            title: shortenAddress(address),
            subtitle: 'Sub-router',
        }));
    }
    const embedded = envioPolicy.strategies ?? [];
    return embedded
        .slice()
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map((s) => {
            const kind = EMBEDDED_STRATEGY_KIND_MAP[s.kind] ?? 'unknown';
            return {
                id: s.id,
                title: EMBEDDED_STRATEGY_LABEL[kind],
                subtitle: shortenAddress(s.address),
            };
        });
};

// ---------------------------------------------------------------------------
// Embedded strategy chain (LMM Money Machine pattern)
// ---------------------------------------------------------------------------

const EMBEDDED_STRATEGY_KIND_MAP: Record<
    EnvioEmbeddedStrategyKind,
    FlowEmbeddedStrategyKind
> = {
    WRAP: 'wrap',
    UNIV2_LIQUIDITY: 'univ2Liquidity',
    GATED_COWSWAP: 'gatedCowSwap',
    COWSWAP: 'cowSwap',
    TRANSFER: 'transfer',
    EPOCH_TRANSFER: 'epochTransfer',
    BURN: 'burn',
    UNKNOWN: 'unknown',
};

const EMBEDDED_STRATEGY_LABEL: Record<FlowEmbeddedStrategyKind, string> = {
    wrap: 'Wrap',
    univ2Liquidity: 'UniV2 Liquidity',
    gatedCowSwap: 'Gated CoW swap',
    cowSwap: 'CoW swap',
    transfer: 'Transfer',
    epochTransfer: 'Epoch transfer',
    burn: 'Burn',
    unknown: 'Strategy',
};

const mapEmbeddedStrategies = (
    strategies: IEnvioStrategy[] | undefined,
): IFlowEmbeddedStrategy[] | undefined => {
    if (!strategies || strategies.length === 0) {
        return undefined;
    }
    const mapped = strategies
        .slice()
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map((s, i): IFlowEmbeddedStrategy => {
            const kind = EMBEDDED_STRATEGY_KIND_MAP[s.kind] ?? 'unknown';
            return {
                id: s.id,
                address: s.address.toLowerCase(),
                kind,
                index: s.index ?? i,
                paused: s.paused,
                label: EMBEDDED_STRATEGY_LABEL[kind],
                budget: s.budget
                    ? {
                          kind:
                              s.budget.kind === 'STREAM_UNTIL'
                                  ? 'streamUntil'
                                  : s.budget.kind === 'FULL'
                                    ? 'full'
                                    : s.budget.kind === 'REQUIRED'
                                      ? 'required'
                                      : 'unknown',
                          floorEpochs: s.budget.floorEpochs ?? undefined,
                          targetEpoch: s.budget.targetEpoch ?? undefined,
                      }
                    : undefined,
                gate: s.gate
                    ? {
                          kind:
                              s.gate.kind === 'PRICE_FLOOR'
                                  ? 'priceFloor'
                                  : 'unknown',
                          threshold: s.gate.threshold ?? undefined,
                          maxStaleness: s.gate.maxStaleness ?? undefined,
                      }
                    : undefined,
                epochProvider: s.epochProvider
                    ? {
                          epochLength: s.epochProvider.epochLength ?? undefined,
                      }
                    : undefined,
            };
        });
    return mapped;
};

// ---------------------------------------------------------------------------
// Orchestrator synthesis (Multi-dispatch)
// ---------------------------------------------------------------------------

const buildOrchestrator = (params: {
    envioPolicy: IEnvioPolicy;
    restPolicy: IDaoPolicy | undefined;
    policiesByAddress: Map<string, IFlowPolicy>;
    proposalByTxHash: ProposalByTxHash | undefined;
}): IFlowOrchestrator => {
    const { envioPolicy, restPolicy, policiesByAddress, proposalByTxHash } =
        params;

    const subRouterAddresses = (restPolicy?.strategy.subRouters ?? []).map(
        (a) => a.toLowerCase(),
    );
    const chain: Array<IFlowPolicy | null> = subRouterAddresses.map(
        (addr) => policiesByAddress.get(addr) ?? null,
    );

    // Group child-policy dispatches by transaction hash. Since `multiDispatch` triggers all
    // its children inside a single tx, the shared `txHash` lets us reconstruct the "run"
    // without any parent-pointer in the indexer.
    const runsByTxHash = new Map<string, IFlowOrchestratorRun>();
    for (const child of chain) {
        if (!child) {
            continue;
        }
        for (const dispatch of child.dispatches) {
            const existing = runsByTxHash.get(dispatch.txHash);
            // For non-swap strategies dispatch.amount/token already describe
            // the OUT leg. For swaps we prefer dispatch.tokenOut (REST metadata)
            // so the chain leg doesn't read "IN WETH → IN WETH".
            const tokenOut = dispatch.tokenOut ?? dispatch.token;
            const amountOut =
                dispatch.amountOut ??
                (dispatch.tokenOut && dispatch.tokenOut !== dispatch.token
                    ? 0
                    : dispatch.amount);
            const leg: IFlowOrchestratorLeg = {
                policyId: child.id,
                policyName: child.name,
                strategy: child.strategy,
                amountOut,
                tokenOut,
                amountIn: dispatch.amountIn,
                tokenIn: dispatch.tokenIn,
                recipientsCount: dispatch.recipientsCount,
                status: dispatch.status ?? 'ok',
            };
            if (existing) {
                existing.legs.push(leg);
                if (
                    new Date(dispatch.at).getTime() >
                    new Date(existing.at).getTime()
                ) {
                    existing.at = dispatch.at;
                }
            } else {
                runsByTxHash.set(dispatch.txHash, {
                    id: `run-${dispatch.txHash}`,
                    at: dispatch.at,
                    txHash: dispatch.txHash,
                    legs: [leg],
                });
            }
        }
    }

    const runs = Array.from(runsByTxHash.values()).sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    );

    const installTxHash = envioPolicy.installTxHash;
    const installAttribution = lookupProposal(proposalByTxHash, installTxHash);
    const uninstallEvent = envioPolicy.events.find(
        (e) => e.kind === 'UNINSTALLED',
    );

    const isUninstalled = envioPolicy.status === 'UNINSTALLED';
    const status: FlowPolicyStatus = isUninstalled
        ? 'paused'
        : runs.length > 0
          ? 'live'
          : 'never';
    const statusLabel = isUninstalled
        ? 'Uninstalled'
        : runs.length > 0
          ? 'Live'
          : 'Never dispatched';

    const strategy: FlowPolicyStrategy =
        STRATEGY_LABEL[envioPolicy.strategyType];

    return {
        id: envioPolicy.id,
        address: envioPolicy.pluginAddress.toLowerCase(),
        name:
            restPolicy?.name ??
            `Multi-dispatch ${shortenAddress(envioPolicy.pluginAddress)}`,
        description:
            restPolicy?.description ??
            `${strategy} plugin installed on ${shortenAddress(envioPolicy.dao.address)}.`,
        strategy,
        status,
        statusLabel,
        createdAt: isoFromSeconds(envioPolicy.installedAt),
        installedViaProposalId: installAttribution?.proposalId,
        installedViaProposalSlug: installAttribution?.slug,
        installedViaProposalTitle: installAttribution?.title,
        installTxHash,
        uninstalledAt: uninstallEvent
            ? isoFromSeconds(uninstallEvent.blockTimestamp)
            : undefined,
        chain,
        embeddedStrategies: mapEmbeddedStrategies(envioPolicy.strategies),
        runs,
        lastRunAt: runs[0]?.at,
        totalRuns: runs.length,
    };
};

// ---------------------------------------------------------------------------
// Grouping (active / neverRun / archived pills)
// ---------------------------------------------------------------------------

const lastActivityTs = (policy: IFlowPolicy): number => {
    if (policy.lastDispatch) {
        return new Date(policy.lastDispatch.at).getTime();
    }
    return new Date(policy.createdAt).getTime();
};

export const groupPolicies = (
    policies: readonly IFlowPolicy[],
): IFlowGroupedPolicies => {
    const active: IFlowPolicy[] = [];
    const neverRun: IFlowPolicy[] = [];
    const archived: IFlowPolicy[] = [];

    for (const policy of policies) {
        if (policy.status === 'paused') {
            archived.push(policy);
        } else if (policy.status === 'never') {
            neverRun.push(policy);
        } else {
            active.push(policy);
        }
    }

    active.sort((a, b) => lastActivityTs(b) - lastActivityTs(a));
    neverRun.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    archived.sort((a, b) => {
        const ats =
            (b.uninstalledAt
                ? new Date(b.uninstalledAt).getTime()
                : lastActivityTs(b)) -
            (a.uninstalledAt
                ? new Date(a.uninstalledAt).getTime()
                : lastActivityTs(a));
        return ats;
    });

    return { active, neverRun, archived };
};

// ---------------------------------------------------------------------------
// Recipients aggregate (dashboard-level)
// ---------------------------------------------------------------------------

const mapRecipientsAggregate = (
    recipientAggregates: readonly IEnvioRecipientAggregate[],
    envioPolicies: readonly IEnvioPolicy[],
    addressBook: IFlowAddressBook,
): IFlowRecipientAggregate[] => {
    const policyById = new Map(envioPolicies.map((p) => [p.id, p]));
    const byRecipient = new Map<string, IFlowRecipientAggregate>();

    for (const r of recipientAggregates) {
        const sourcePolicy = policyById.get(r.policy.id);
        const group = sourcePolicy
            ? `${STRATEGY_LABEL[sourcePolicy.strategyType]}`
            : 'Unknown';
        const key = r.recipient;
        const existing = byRecipient.get(key);
        const amount = normaliseAmount(r.totalAmount, r.token.decimals);
        const tokenSymbol = r.token.symbol as FlowTokenSymbol;
        if (existing) {
            existing.amountsByToken[tokenSymbol] =
                (existing.amountsByToken[tokenSymbol] ?? 0) + amount;
            existing.dispatchCount += r.transferCount;
            if (
                toMillis(r.lastAt) > new Date(existing.lastReceivedAt).getTime()
            ) {
                existing.lastReceivedAt = isoFromSeconds(r.lastAt);
            }
            if (!existing.fromPolicyIds.includes(r.policy.id)) {
                existing.fromPolicyIds.push(r.policy.id);
            }
        } else {
            const resolved = addressBook.resolve(r.recipient);
            byRecipient.set(key, {
                address: r.recipient,
                name: resolved?.label ?? shortenAddress(r.recipient),
                ens: resolved?.ens ?? undefined,
                role: resolved?.role,
                group,
                fromPolicyIds: [r.policy.id],
                amountsByToken: { [tokenSymbol]: amount } as Partial<
                    Record<FlowTokenSymbol, number>
                >,
                dispatchCount: r.transferCount,
                lastReceivedAt: isoFromSeconds(r.lastAt),
            });
        }
    }

    return Array.from(byRecipient.values()).sort(
        (a, b) =>
            new Date(b.lastReceivedAt).getTime() -
            new Date(a.lastReceivedAt).getTime(),
    );
};

// ---------------------------------------------------------------------------
// Top-level mapper
// ---------------------------------------------------------------------------

export interface IBuildFlowDataFromEnvioParams {
    network: string;
    addressOrEns: string;
    daoDisplayName?: string;
    indexerData: IFlowDaoDataResponse;
    restPolicies: readonly IDaoPolicy[];
    linkedAccounts?: readonly ILinkedAccountSummary[];
    /**
     * Map from lowercase transaction hash to governance-proposal attribution. Built in
     * the provider from `useProposalList` so the mapper stays free of governance-service
     * dependencies. Unset → events/policies get `proposalSlug === undefined`.
     */
    proposalByTxHash?: ProposalByTxHash;
    /**
     * Synchronous address-name resolver assembled in the provider from DAO info,
     * linked accounts, REST policies, and burn addresses. Used to replace the
     * default `shortenAddress` rendering with a human label in 3 places: per-policy
     * dispatch recipients, per-policy aggregate recipients, and the dashboard-wide
     * recipient aggregate. Unset → falls back to the empty book (renders truncated).
     */
    addressBook?: IFlowAddressBook;
}

const buildDao = (params: IBuildFlowDataFromEnvioParams): IFlowDao => ({
    network: params.network,
    addressOrEns: params.addressOrEns,
    name: params.daoDisplayName ?? 'DAO',
    avatarColor: '#003bf5',
});

export const buildFlowDataFromEnvio = (
    params: IBuildFlowDataFromEnvioParams,
): IFlowDaoData => {
    const {
        indexerData,
        restPolicies,
        proposalByTxHash,
        addressBook = EMPTY_FLOW_ADDRESS_BOOK,
    } = params;

    // Envio keys policies by (chainId:pluginAddress). REST keys by pluginAddress. Join on
    // lowercase plugin address.
    const restByPlugin = new Map<string, IDaoPolicy>();
    for (const p of restPolicies) {
        restByPlugin.set(p.address.toLowerCase(), p);
    }

    // Pass 1: map all policies (leaves + orchestrators) as leaf policies so the
    // orchestrator builder can look children up by plugin address.
    const allLeafPolicies = indexerData.Policy.map((envioPolicy) =>
        mapPolicy({
            envioPolicy,
            restPolicy: restByPlugin.get(
                envioPolicy.pluginAddress.toLowerCase(),
            ),
            recipientAggregates: indexerData.RecipientAggregate,
            proposalByTxHash,
            addressBook,
        }),
    );

    const policiesByAddress = new Map<string, IFlowPolicy>();
    for (const p of allLeafPolicies) {
        policiesByAddress.set(p.address.toLowerCase(), p);
    }

    // Pass 2: split into orchestrators vs leaves.  Orchestrators get a paired
    // `IFlowPolicy` mirror so the policy-detail route can resolve their id —
    // see `IFlowDaoData.orchestratorPolicies`.
    const orchestrators: IFlowOrchestrator[] = [];
    const orchestratorPolicies: IFlowPolicy[] = [];
    const leafPolicies: IFlowPolicy[] = [];
    for (const envioPolicy of indexerData.Policy) {
        if (isOrchestratorStrategyType(envioPolicy.strategyType)) {
            orchestrators.push(
                buildOrchestrator({
                    envioPolicy,
                    restPolicy: restByPlugin.get(
                        envioPolicy.pluginAddress.toLowerCase(),
                    ),
                    policiesByAddress,
                    proposalByTxHash,
                }),
            );
            const mirror = policiesByAddress.get(
                envioPolicy.pluginAddress.toLowerCase(),
            );
            if (mirror) {
                orchestratorPolicies.push(mirror);
            }
        } else {
            const mapped = policiesByAddress.get(
                envioPolicy.pluginAddress.toLowerCase(),
            );
            if (mapped) {
                leafPolicies.push(mapped);
            }
        }
    }

    // Sort orchestrators: active first (by lastRunAt DESC), then never-run, archived last.
    orchestrators.sort((a, b) => {
        const aKey = a.status === 'paused' ? 0 : a.lastRunAt ? 2 : 1;
        const bKey = b.status === 'paused' ? 0 : b.lastRunAt ? 2 : 1;
        if (aKey !== bKey) {
            return bKey - aKey;
        }
        const aTs = a.lastRunAt
            ? new Date(a.lastRunAt).getTime()
            : new Date(a.createdAt).getTime();
        const bTs = b.lastRunAt
            ? new Date(b.lastRunAt).getTime()
            : new Date(b.createdAt).getTime();
        return bTs - aTs;
    });

    // Back-compat: keep the flat `policies` list in install-order, like before (useful for
    // the detail page + activity preview that iterates everything).
    const policies = [...leafPolicies].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const groupedPolicies = groupPolicies(leafPolicies);

    return {
        dao: buildDao(params),
        policies,
        groupedPolicies,
        orchestrators,
        orchestratorPolicies,
        recipients: mapRecipientsAggregate(
            indexerData.RecipientAggregate,
            indexerData.Policy,
            addressBook,
        ),
    };
};

// Re-exported for the provider to detect "empty indexer state" and fall back to a hint UI.
export { DAY_MS };

// Suppress unused imports warning for PolicyStrategyType if tsc ever removes the discriminant.
void PolicyStrategyType;

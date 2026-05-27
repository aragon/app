/**
 * Pure selectors that re-derive presentation state from the already-mapped
 * `IFlowDaoData` snapshot. They take an explicit `now: number` so callers
 * can drive everything off the LMM-demo `chainNowMs` clock without having
 * to bake that into the mapper.
 *
 * Why selectors live here instead of inside `envioFlowMapper.ts`:
 *
 * - The mapper runs once per Envio refetch and caches its result. Anything
 *   that depends on "what time is it right now" (cooldown countdown, ready
 *   gating, queued amounts merged in from a live RPC read) belongs on the
 *   render path so it reacts to `chainNowMs` ticks and `useLmmLiveSnapshot`
 *   refreshes without invalidating the React-Query cache.
 * - The mapper output type already exposes `cooldown.readyAt` and a
 *   pre-baked `status`/`statusLabel`. Selectors re-derive both from the
 *   raw cooldown + the orchestrator's live pending so a single source of
 *   truth flows through KPI, Activity, Recipients and the detail page.
 */

import type { LmmLiveSnapshot } from '../demo/useLmmLiveSnapshot';
import type {
    FlowPolicyStatus,
    FlowTokenSymbol,
    IFlowDaoData,
    IFlowPending,
    IFlowPolicy,
} from '../types';

/**
 * Flat list of every policy on the DAO — leaves + orchestrator mirrors —
 * so KPI counters, activity feed and recipients table stop ignoring the
 * orchestrator surface that lives on `data.orchestratorPolicies`.
 *
 * Order matches the existing UI conventions: leaf policies first (sorted
 * by install date in the mapper), orchestrator mirrors after, so the
 * "Recent activity" feed still puts the most-recent leaf executions at
 * the top of the timeline by default.
 */
export const getAllPolicies = (data: IFlowDaoData | null): IFlowPolicy[] => {
    if (data == null) {
        return [];
    }
    return [...data.policies, ...(data.orchestratorPolicies ?? [])];
};

/**
 * Re-derive a policy's `{ status, statusLabel }` against a caller-provided
 * `now` (chain-time or wall-time). Mirrors the original mapper logic but
 * also opens the door to "first-run ready" — when an orchestrator has
 * never dispatched but its budgets are funded (`pending.amount > 0`) we
 * surface it as `ready` so the KPI doesn't read "0" while the legs sit
 * with 100 stETH queued.
 */
export const derivePolicyStatus = (
    policy: IFlowPolicy,
    now: number,
    pending?: IFlowPending | null,
): { status: FlowPolicyStatus; statusLabel: string } => {
    if (policy.uninstalledAt != null) {
        return { status: 'paused', statusLabel: 'Uninstalled' };
    }
    if (policy.failedLastDispatch != null) {
        return {
            status: 'awaiting',
            statusLabel: 'Awaiting review · last dispatch failed',
        };
    }
    if (policy.lastDispatch == null) {
        if (pending != null && pending.amount > 0) {
            return { status: 'ready', statusLabel: 'Ready to dispatch' };
        }
        return { status: 'never', statusLabel: 'Never dispatched' };
    }
    if (policy.cooldown != null) {
        const readyMs = new Date(policy.cooldown.readyAt).getTime();
        if (readyMs > now) {
            return {
                status: 'cooldown',
                statusLabel: 'Cooldown · awaiting next epoch',
            };
        }
        return { status: 'ready', statusLabel: 'Ready to dispatch' };
    }
    return { status: 'live', statusLabel: 'Live' };
};

/**
 * `true` when the policy is dispatch-ready right now. Combines the cooldown
 * comparison with the orchestrator-aware "first-run ready" rule so an
 * orchestrator with `chain.legs[].budget() > 0` but no recorded dispatch
 * still counts toward the KPI.
 */
export const isPolicyReady = (
    policy: IFlowPolicy,
    now: number,
    pending?: IFlowPending | null,
): boolean => derivePolicyStatus(policy, now, pending).status === 'ready';

// ---------------------------------------------------------------------------
// LMM live-snapshot → orchestrator overlay
// ---------------------------------------------------------------------------

// LMM_DEMO_HACK: in demo mode the orchestrator has 3 legs (Wrap / UniV2 / CowSwap)
// each pulling from its own budget contract.  `useLmmLiveSnapshot` reads the
// per-budget amount directly from Anvil; we mirror those readings as a
// `pending` view on the matching `IFlowPolicy` so KPI / status selectors can
// say "100 stETH + 36.4 LDO ready" instead of "0".  Production replacement:
// expose an `OrchestratorSnapshot` entity in Envio so the indexer drops
// budget readings into the GraphQL payload directly — see lido-mmd-status.md
// row `pending-from-live`.
export interface ILmmLegAggregate {
    label: string;
    amount: number;
    token: FlowTokenSymbol;
}

const RAW_TO_NUMBER = (raw: bigint, decimals: number | null): number => {
    if (decimals == null || decimals <= 0) {
        return Number(raw);
    }
    const base = BigInt(10) ** BigInt(decimals);
    const whole = Number(raw / base);
    const frac = Number(raw % base) / Number(base);
    return whole + frac;
};

/**
 * Sum per-token budget readings from the LMM live snapshot and return the
 * dominant token aggregate (largest by absolute amount). Used to feed the
 * orchestrator's `pending` field so the existing KPI / status selectors
 * treat it like any other ready policy.
 */
export const summariseLmmLegs = (
    snapshot: LmmLiveSnapshot | null,
): { dominant?: IFlowPending; legs: ILmmLegAggregate[] } => {
    if (snapshot == null) {
        return { legs: [] };
    }
    const byToken = new Map<
        string,
        { token: FlowTokenSymbol; amount: number; label: string }
    >();
    for (const b of snapshot.budgets) {
        const sym = (b.token.symbol ??
            b.token.address.slice(0, 6)) as FlowTokenSymbol;
        const amount = RAW_TO_NUMBER(b.amount, b.token.decimals);
        const existing = byToken.get(sym);
        if (existing) {
            existing.amount += amount;
        } else {
            byToken.set(sym, { token: sym, amount, label: b.label });
        }
    }
    const legs: ILmmLegAggregate[] = Array.from(byToken.values())
        .map((v) => ({ label: v.label, amount: v.amount, token: v.token }))
        .sort((a, b) => b.amount - a.amount);
    if (legs.length === 0 || legs[0].amount <= 0) {
        return { legs };
    }
    return {
        dominant: { amount: legs[0].amount, token: legs[0].token },
        legs,
    };
};

/**
 * Return the `pending` view for a policy. For LMM demo orchestrators this
 * is sourced from the live snapshot; everything else falls back to the
 * value the mapper already baked in.
 */
export const selectPolicyPending = (
    policy: IFlowPolicy,
    lmmOrchestratorPending: IFlowPending | null | undefined,
    lmmOrchestratorAddress: string | undefined,
): IFlowPending | null => {
    if (
        lmmOrchestratorAddress != null &&
        policy.address.toLowerCase() === lmmOrchestratorAddress.toLowerCase()
    ) {
        return lmmOrchestratorPending ?? policy.pending;
    }
    return policy.pending;
};

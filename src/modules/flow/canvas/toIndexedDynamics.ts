/**
 * Indexed-dynamics producer — projects the indexer's settled provenance graph
 * ({@link IFlowIndexedStep}, normalised from `FlowStep` / `FlowEdge` /
 * `SwapFill`) onto the generic {@link IFlowDynamics} overlay that
 * {@link buildFlowGraph} consumes.
 *
 * This is the authoritative replacement for the heuristic run reconstruction:
 * edge amounts are the real, on-chain-settled values the indexer tagged with a
 * provenance (wrap output, LP minted, CoW fill), so the canvas PROJECTS them
 * rather than guessing "largest approve = swap sell" or "first wrap = leg
 * input". Nothing here is LMM-specific or token-hard-coded — every value comes
 * from a {@link IFlowIndexedEdge}.
 *
 * Two producers:
 *  - {@link toIndexedDynamics}  — a run (replay) or an overview snapshot.
 *  - {@link mergeLiveOverlay}   — layers the RPC live readings (budget / gate /
 *    epoch sub-node values + vault balances + current would-fire state) on top
 *    of indexed amounts, for the default "live" view.
 */

import type {
    FlowRuntimeState,
    IFlowDynamics,
    IFlowEdgeFlow,
    IFlowIndexedEdge,
    IFlowIndexedStep,
    IFlowStepDynamics,
} from './flowGraphTypes';

/** Indexed status → canvas runtime state. Executed legs read as `done`
 *  (historical), gated skips as `blocked`, paused as `skipped`. */
const stateForStatus = (step: IFlowIndexedStep): FlowRuntimeState => {
    switch (step.status) {
        case 'executed':
            return 'done';
        case 'skippedGated':
            return 'blocked';
        case 'skippedPaused':
            return 'skipped';
        case 'failed':
            return 'failed';
        default:
            // no-op / opaque — nothing moved this run.
            return 'idle';
    }
};

const edgeToFlow = (edge: IFlowIndexedEdge): IFlowEdgeFlow => ({
    token: edge.token,
    amount: edge.amount,
    fidelity: edge.fidelity,
    perEpoch: edge.perEpoch,
});

/**
 * Every token this step produces — proceeds looped back to the operational DAO
 * vault and any output that lands at a different address (a genuine external
 * recipient, e.g. UniV2 LP minted to the Lido Agent). All are emitted (flagged
 * `external` for the latter) so the canvas draws a real arrow per output.
 *
 * Classification is by the edge's actual `to`, not just the indexer's role:
 * the indexer marks LP-to-Agent as `vaultIn`, but if `to` isn't the operational
 * DAO it is shown going to that recipient, matching the live simulation.
 */
const outFlowsForStep = (
    step: IFlowIndexedStep,
    daoAddress: string | undefined,
): IFlowEdgeFlow[] =>
    step.edges
        .filter((e) => e.role === 'vaultIn' || e.role === 'external')
        .map((edge) => {
            const external =
                edge.role === 'external' ||
                (daoAddress != null &&
                    edge.to != null &&
                    edge.to.toLowerCase() !== daoAddress.toLowerCase());
            return {
                token: edge.token,
                amount: edge.amount,
                fidelity: edge.fidelity,
                perEpoch: edge.perEpoch,
                external: external ? true : undefined,
                to: external ? edge.to : undefined,
            };
        });

/** Tokens this step pulls from the vault (`vaultOut`), deduped by token. */
const inFlowsForStep = (step: IFlowIndexedStep): IFlowEdgeFlow[] => {
    const ins: IFlowEdgeFlow[] = [];
    for (const edge of step.edges) {
        if (edge.role !== 'vaultOut') {
            continue;
        }
        if (ins.some((i) => i.token === edge.token)) {
            continue;
        }
        ins.push(edgeToFlow(edge));
    }
    return ins;
};

const compactReason = (reason: string | undefined): string | undefined => {
    if (!reason) {
        return undefined;
    }
    return reason.length > 32 ? `${reason.slice(0, 29)}…` : reason;
};

const badgeForStep = (
    step: IFlowIndexedStep,
    state: FlowRuntimeState,
): string | undefined => {
    if (state === 'blocked' || step.status === 'noOp') {
        return compactReason(step.reason) ?? 'no-op';
    }
    if (state === 'skipped') {
        return 'paused';
    }
    if (state === 'failed') {
        return compactReason(step.reason) ?? 'failed';
    }
    return undefined;
};

export interface IToIndexedDynamicsParams {
    steps: readonly IFlowIndexedStep[];
    /** Non-null marks a replayed historical run; null = live overview. */
    runId?: string | null;
    /** The operational DAO vault address. Outputs landing elsewhere are shown as
     *  external recipients (e.g. LP to the Lido Agent), not looped to the vault. */
    daoAddress?: string;
}

/**
 * Project a set of indexed steps onto {@link IFlowDynamics}. The set is either
 * one run's legs (replay) or the latest-per-strategy composite (overview).
 */
export const toIndexedDynamics = (
    params: IToIndexedDynamicsParams,
): IFlowDynamics => {
    const { steps, runId = null, daoAddress } = params;
    const dynSteps: IFlowStepDynamics[] = steps.map((step) => {
        const state = stateForStatus(step);
        return {
            address: step.address,
            index: step.index,
            state,
            badge: badgeForStep(step, state),
            blocked: state === 'blocked',
            outs: outFlowsForStep(step, daoAddress),
            ins: inFlowsForStep(step),
            skipReason: step.reason,
        };
    });
    return { runId, steps: dynSteps };
};

/**
 * Layer a live RPC overlay onto indexed dynamics for the default view: indexed
 * edge amounts (real, settled provenance) are kept, while the live snapshot
 * supplies the things the indexer can't know in real time — per-input readings
 * (budget / gate / epoch), vault balances, and the current would-fire / blocked
 * state of each step. Steps present only in `live` (e.g. a leg that has never
 * run but the simulator can still reason about) are appended.
 */
export const mergeLiveOverlay = (
    indexed: IFlowDynamics,
    live: IFlowDynamics | null,
): IFlowDynamics => {
    if (!live) {
        return indexed;
    }
    const liveByAddress = new Map<string, IFlowStepDynamics>();
    for (const s of live.steps) {
        liveByAddress.set(s.address.toLowerCase(), s);
    }

    const merged: IFlowStepDynamics[] = indexed.steps.map((base) => {
        const overlay = liveByAddress.get(base.address.toLowerCase());
        liveByAddress.delete(base.address.toLowerCase());
        if (!overlay) {
            return base;
        }
        return {
            ...base,
            // Live wins for readiness signals; indexed wins for amounts.
            state: overlay.state,
            badge: overlay.badge ?? base.badge,
            blocked: overlay.blocked ?? base.blocked,
            inputReadings: overlay.inputReadings ?? base.inputReadings,
            skipReason: overlay.skipReason ?? base.skipReason,
        };
    });

    // Legs the indexer hasn't seen yet but the live simulator describes.
    for (const leftover of liveByAddress.values()) {
        merged.push(leftover);
    }

    return {
        runId: null,
        steps: merged,
        balances: live.balances ?? indexed.balances,
    };
};

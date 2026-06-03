/**
 * Pure builders that turn the generic flow data (`IFlowDaoData` + an optional
 * live-dynamics overlay) into the workbench's presentational view-model.
 *
 * Token-only, USD-free, and flow-shape-agnostic: a flow is any orchestrator,
 * stats/history come from its runs, and the next-run summary is derived from
 * the same live dynamics the canvas uses. Replay dynamics are projected from a
 * recorded run's legs. Nothing here is LMM-specific.
 */

import { MEANINGFUL_AMOUNT_EPS } from '../../canvas/buildFlowGraph';
import type {
    IFlowDynamics,
    IFlowIndexedStep,
    IFlowMachineDescriptor,
    IFlowStepDynamics,
} from '../../canvas/flowGraphTypes';
import type {
    IFlowDaoData,
    IFlowOrchestrator,
    IFlowOrchestratorRun,
} from '../../types';
import { formatRelative } from '../../utils/flowFormatters';
import type {
    IFlowOption,
    IHistoryLeg,
    IHistoryRun,
    INextRun,
    ITokenAmount,
    ITokenFlow,
    IWorkbenchStats,
    RunStatus,
} from './workbenchModel';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Human-language description of a flow. */
export interface IFlowDescription {
    title: string;
    summary: string;
    /** One short verb-phrase per strategy, in pipeline order. */
    steps: string[];
}

// Per-kind verb phrase for the auto-generated summary. NOTE: this is a
// structural fallback derived from the strategy taxonomy — once flows carry an
// author-written purpose (added at creation time) we render that instead.
const KIND_PHRASE: Record<string, string> = {
    wrap: 'wraps the staking token',
    univ2Liquidity: 'provides Uniswap V2 liquidity',
    gatedCowSwap: 'runs a price-gated buyback via CoW Swap',
    cowSwap: 'buys back tokens via CoW Swap',
    transfer: 'transfers tokens to recipients',
    epochTransfer: 'streams tokens each epoch',
    burn: 'burns tokens',
    unknown: 'runs a custom strategy',
};

/**
 * Build a human-readable description of what a flow does, generated from its
 * strategy pipeline. Display-first placeholder until author-written purpose
 * metadata exists.
 */
export const buildFlowDescription = (
    orchestrator: IFlowOrchestrator,
): IFlowDescription => {
    const ordered = [...(orchestrator.embeddedStrategies ?? [])].sort(
        (a, b) => a.index - b.index,
    );
    const steps = ordered.map(
        (s) => KIND_PHRASE[s.kind] ?? KIND_PHRASE.unknown,
    );
    const summary =
        steps.length > 0
            ? `Automates the DAO treasury: ${steps.join(', then ')} — with proceeds returning to the vault.`
            : 'An on-chain capital-flow automation for the DAO treasury.';
    return { title: orchestrator.name, summary, steps };
};

/** Each orchestrator is a flow. Status is "live" once it has run. */
export const buildFlowOptions = (data: IFlowDaoData): IFlowOption[] =>
    data.orchestrators.map((o) => ({
        id: o.id,
        name: o.name,
        type: o.strategy,
        strategies: o.embeddedStrategies?.length ?? o.chain.length,
        status: o.totalRuns > 0 ? 'live' : 'never run',
    }));

/** Top non-DAO recipient across the DAO, used as the terminal hint. */
export const buildRecipientHint = (
    data: IFlowDaoData,
): { label: string; address?: string } | undefined => {
    const candidate = [...data.recipients]
        .filter((r) => r.role !== 'dao')
        .sort((a, b) => b.dispatchCount - a.dispatchCount)[0];
    if (!candidate) {
        return undefined;
    }
    return { label: candidate.name, address: candidate.address };
};

const sumByToken = (entries: ITokenAmount[]): ITokenAmount[] => {
    const map = new Map<string, number>();
    for (const e of entries) {
        if (e.amount == null) {
            continue;
        }
        map.set(e.token, (map.get(e.token) ?? 0) + e.amount);
    }
    return [...map.entries()].map(([token, amount]) => ({ token, amount }));
};

const runStatus = (run: IFlowOrchestratorRun): RunStatus => {
    if (run.legs.some((l) => l.status === 'failed')) {
        return 'failed';
    }
    if (run.legs.some((l) => l.status === 'skipped')) {
        return 'partial';
    }
    return 'ok';
};

/**
 * Per-token in/out throughput across every run, projected from the indexed
 * provenance edges (real settled amounts). `outAmount` = left the vault
 * (vault-out + external); `inAmount` = produced back to the vault (vault-in).
 * Opaque inflows (e.g. LP pre-settlement) are flagged rather than summed as 0.
 */
const buildTokenFlows = (steps: readonly IFlowIndexedStep[]): ITokenFlow[] => {
    const byToken = new Map<string, ITokenFlow>();
    const entry = (token: string): ITokenFlow => {
        const found = byToken.get(token);
        if (found) {
            return found;
        }
        const created: ITokenFlow = { token, inAmount: 0, outAmount: 0 };
        byToken.set(token, created);
        return created;
    };
    for (const step of steps) {
        for (const edge of step.edges) {
            const row = entry(edge.token);
            if (edge.role === 'vaultIn') {
                if (edge.amount == null) {
                    row.opaqueIn = true;
                } else {
                    row.inAmount += edge.amount;
                }
            } else if (edge.amount != null) {
                // vaultOut + external — value that left the vault.
                row.outAmount += edge.amount;
            }
        }
    }
    return [...byToken.values()]
        .filter((f) => f.inAmount > 0 || f.outAmount > 0 || f.opaqueIn)
        .sort((a, b) => b.inAmount + b.outAmount - (a.inAmount + a.outAmount));
};

export const buildStats = (
    orchestrator: IFlowOrchestrator,
    now: number,
): IWorkbenchStats => {
    const runs = orchestrator.runs;
    const successful = runs.filter((r) => runStatus(r) === 'ok').length;
    const moved: ITokenAmount[] = [];
    const buybacks: ITokenAmount[] = [];
    for (const run of runs) {
        for (const leg of run.legs) {
            if (leg.status !== 'ok' || leg.amountOut == null) {
                continue;
            }
            moved.push({ token: leg.tokenOut, amount: leg.amountOut });
            if (
                leg.strategy === 'CoW swap' ||
                leg.strategy === 'Uniswap swap'
            ) {
                buybacks.push({ token: leg.tokenOut, amount: leg.amountOut });
            }
        }
    }
    const allIndexedSteps = runs.flatMap((r) => r.indexedSteps ?? []);
    const createdMs = Date.parse(orchestrator.createdAt);
    const activeSinceDays = Number.isFinite(createdMs)
        ? Math.max(1, Math.round((now - createdMs) / DAY_MS))
        : 0;
    return {
        dispatches: orchestrator.totalRuns,
        activeSinceDays,
        successRate: runs.length > 0 ? successful / runs.length : 0,
        totalMoved: sumByToken(moved),
        buybacks: sumByToken(buybacks),
        tokenFlows: buildTokenFlows(allIndexedSteps),
    };
};

const shortTx = (txHash: string): string =>
    txHash.length > 10 ? `${txHash.slice(0, 6)}…` : txHash;

export const buildHistory = (
    orchestrator: IFlowOrchestrator,
    now: number,
): IHistoryRun[] =>
    orchestrator.runs.map((run, i) => {
        const legs: IHistoryLeg[] = run.legs.map((leg) => ({
            kind: leg.strategy,
            ok: leg.status === 'ok',
            skipped: leg.status === 'skipped',
            failed: leg.status === 'failed',
            detail:
                leg.amountOut != null
                    ? `${leg.amountOut.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${leg.tokenOut}`
                    : undefined,
        }));
        return {
            run: run.id,
            label: `#${orchestrator.totalRuns - i}`,
            at: formatRelative(run.at, now),
            status: runStatus(run),
            legs,
            tx: shortTx(run.txHash),
        };
    });

/**
 * Next-dispatch summary derived from the live dynamics (so the modal and the
 * canvas agree). `kind` labels are resolved from the descriptor by address.
 */
export const buildNextRun = (
    descriptor: IFlowMachineDescriptor,
    dynamics: IFlowDynamics,
): INextRun => {
    const labelFor = (address: string): string =>
        descriptor.steps.find(
            (s) => s.address.toLowerCase() === address.toLowerCase(),
        )?.label ?? 'Strategy';

    const moves = (a: number | null): boolean =>
        a == null || Math.abs(a) > MEANINGFUL_AMOUNT_EPS;
    const steps = dynamics.steps.map((s) => {
        const kind = labelFor(s.address);
        // "Firing" only counts if a meaningful amount actually moves — a leg
        // that fires on dust (1 wei) reads as a no-op, matching the canvas.
        const willFire =
            s.state === 'firing' &&
            ((s.ins ?? []).some((i) => moves(i.amount)) ||
                (s.outs ?? []).some((o) => moves(o.amount)));
        return {
            kind,
            willFire,
            ins: (s.ins ?? []).map((i) => ({
                token: i.token,
                amount: i.amount,
                fidelity: i.fidelity,
            })),
            outs:
                s.outs && s.outs.length > 0
                    ? s.outs.map((o) => ({
                          token: o.token,
                          amount: o.amount,
                          fidelity: o.fidelity,
                      }))
                    : [
                          {
                              token: '?',
                              amount: null,
                              fidelity: 'opaque' as const,
                          },
                      ],
            skipReason: willFire ? undefined : s.skipReason,
        };
    });

    const epochReading = dynamics.steps
        .flatMap((s) => s.inputReadings ?? [])
        .find((r) => r.epoch != null)?.epoch;

    const summary = steps
        .map((s) => (s.willFire ? s.kind : `${s.kind} skipped`))
        .join(' · ');

    // Net to the DAO after this dispatch: returns (outs that loop back, i.e.
    // not flagged external) minus draws (ins). Mirrors the canvas vault node.
    const net = new Map<string, { delta: number; opaque: boolean }>();
    const bump = (token: string, signed: number, opaque: boolean) => {
        const e = net.get(token) ?? { delta: 0, opaque: false };
        e.delta += signed;
        e.opaque = e.opaque || opaque;
        net.set(token, e);
    };
    for (const s of dynamics.steps) {
        if (s.state !== 'firing') {
            continue;
        }
        for (const i of s.ins ?? []) {
            bump(i.token, i.amount == null ? 0 : -i.amount, i.amount == null);
        }
        for (const o of s.outs ?? []) {
            if (o.external) {
                continue;
            }
            bump(o.token, o.amount == null ? 0 : o.amount, o.amount == null);
        }
    }
    const netEntries = [...net.entries()]
        .filter(
            ([, v]) => Math.abs(v.delta) > MEANINGFUL_AMOUNT_EPS || v.opaque,
        )
        .map(([token, v]) => ({
            token,
            delta: v.delta,
            opaque: v.opaque || undefined,
        }));

    return { epoch: epochReading, summary, steps, net: netEntries };
};

/** Map a recorded run's legs onto replay dynamics, matched to steps by order. */
export const toRunDynamics = (
    descriptor: IFlowMachineDescriptor,
    run: IFlowOrchestratorRun,
): IFlowDynamics => {
    const steps: IFlowStepDynamics[] = descriptor.steps.map(
        (descriptorStep, i) => {
            const leg = run.legs[i];
            const state =
                leg == null
                    ? 'idle'
                    : leg.status === 'failed'
                      ? 'failed'
                      : leg.status === 'skipped'
                        ? 'skipped'
                        : 'done';
            return {
                address: descriptorStep.address,
                index: descriptorStep.index,
                state,
                ins:
                    leg?.tokenIn != null && leg.amountIn != null
                        ? [
                              {
                                  token: leg.tokenIn,
                                  amount: leg.amountIn,
                                  fidelity: 'real' as const,
                              },
                          ]
                        : undefined,
                outs:
                    leg != null && leg.amountOut != null
                        ? [
                              {
                                  token: leg.tokenOut,
                                  amount: leg.amountOut,
                                  fidelity: 'real' as const,
                              },
                          ]
                        : undefined,
            };
        },
    );
    return { runId: run.id, steps };
};

/**
 * Presentational view-model for the Flow Workbench.
 *
 * These are the token-only, USD-free shapes the workbench chrome (header
 * selector, cumulative stats, next-run summary, dispatch history) renders.
 * They are assembled by `buildWorkbenchModel` from the generic flow data
 * (`IFlowDaoData` + the live snapshot) — never hard-coded, never LMM-specific.
 *
 * The canvas itself is NOT described here: it is built separately from the
 * `IFlowMachineDescriptor` + `IFlowDynamics` so live and replayed runs can be
 * re-graphed reactively (see `buildFlowGraph`).
 */

import type { FlowFidelity, IFlowNetEntry } from '../../canvas/flowGraphTypes';

/** A token-denominated amount (no USD, per v1). `amount === null` = opaque. */
export interface ITokenAmount {
    token: string;
    amount: number | null;
}

/** One entry in the flow dropdown. */
export interface IFlowOption {
    id: string;
    name: string;
    /** Generic type label, e.g. "Multi-dispatch" / "Router" / "Claimer". */
    type: string;
    strategies: number;
    /** Display status — "live" tones green, anything else neutral. */
    status: string;
}

/**
 * Per-token throughput across every run of a flow. `out` is everything that
 * left the vault into a strategy/recipient (vault-out + external edges); `in`
 * is everything produced back to the vault (vault-in edges). Lets the cumulative
 * panel answer "how much stETH did we spend, how much LDO did we buy back".
 */
export interface ITokenFlow {
    token: string;
    inAmount: number;
    outAmount: number;
    /** Some inflow amount is opaque (e.g. LP minted pre-settlement). */
    opaqueIn?: boolean;
}

/** Cumulative, token-only stats for the selected flow. */
export interface IWorkbenchStats {
    dispatches: number;
    activeSinceDays: number;
    /** 0..1. */
    successRate: number;
    totalMoved: ITokenAmount[];
    buybacks: ITokenAmount[];
    /** Full per-token in/out breakdown across all runs. */
    tokenFlows: ITokenFlow[];
}

/** One leg of the simulated next dispatch. */
export interface ISimStep {
    kind: string;
    willFire: boolean;
    ins: ITokenAmountFidelity[];
    /** Every token the leg produces back to the vault / out — one per arrow. */
    outs: ITokenAmountFidelity[];
    skipReason?: string;
}

export interface ITokenAmountFidelity extends ITokenAmount {
    fidelity?: FlowFidelity;
}

/** Predicted next dispatch summary (from the simulator). */
export interface INextRun {
    readyIn?: string;
    epoch?: number;
    summary: string;
    steps: ISimStep[];
    /** Net token delta to the DAO vault after this dispatch (returns − draws,
     *  external outputs excluded). Mirrors the canvas vault node. */
    net: IFlowNetEntry[];
}

export type RunStatus = 'ok' | 'partial' | 'failed';

export interface IHistoryLeg {
    kind: string;
    ok?: boolean;
    skipped?: boolean;
    failed?: boolean;
    detail?: string;
    reason?: string;
}

export interface IHistoryRun {
    /** Stable run id (used in `?run=` selection + replay). */
    run: string;
    /** Short numeric/label shown in the strip (e.g. "#42"). */
    label: string;
    at: string;
    status: RunStatus;
    legs?: IHistoryLeg[];
    tx: string;
}

export interface IWorkbenchModel {
    dao: string;
    flows: IFlowOption[];
    selectedFlowId: string | null;
    stats: IWorkbenchStats | null;
    nextRun: INextRun | null;
    history: IHistoryRun[];
    /** Whether the selected flow has a live snapshot (drives the Live badge). */
    isLive: boolean;
}

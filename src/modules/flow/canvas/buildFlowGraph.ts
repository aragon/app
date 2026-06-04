/**
 * buildFlowGraph — pure, data-driven construction of the canvas graph.
 *
 * Inputs: a static {@link IFlowMachineDescriptor} (structure, from the indexer
 * taxonomy) + optional {@link IFlowDynamics} (live overlay or a replayed run).
 * Output: positioned {@link IFlowGraph} the ported canvas renders 1:1.
 *
 * MODEL — hub-and-spoke around the ONE vault. A money machine is not a linear
 * wrap→liquidity→buyback pipeline: it is a set of legs that each independently
 * draw capital from the DAO vault and return proceeds to it, executed in
 * strategy `index` order. So:
 *   - There is ONE vault node (the DAO) — the funding source AND where proceeds
 *     land. We never render the treasury twice.
 *   - `feeds`       — vault → leg, one per token the leg draws (`ins`, the
 *                     indexed VAULT_OUT edges). Stream slices carry `/epoch`.
 *   - `returns`     — leg → vault, one per token the leg loops back (`outs`
 *                     without `external`, the indexed VAULT_IN edges).
 *   - `distributes` — leg → an external recipient, for genuine outbound
 *                     transfers (`outs` with `external`, indexed EXTERNAL edges).
 * Nothing is inferred by token-matching across legs — every edge is a real,
 * per-leg in/out movement from the dynamics. This stops fabricating leg→leg
 * "pipeline" edges and stops hiding the value a leg retains in the vault (e.g. a
 * wrap that pools wstETH back into the DAO).
 *
 * The vault node also carries `net` — the per-token delta to the DAO after the
 * dispatch (returns − feeds) — so the canvas can state how much actually lands.
 *
 * NO HARDCODE: nothing knows about Lido/stETH/a fixed leg count. With no
 * dynamics (a never-run flow) it falls back to vault → each leg `feeds` edges so
 * the structure still reads.
 */

import type {
    FlowRuntimeState,
    IFlowDynamics,
    IFlowGraph,
    IFlowGraphEdge,
    IFlowGraphNode,
    IFlowMachineDescriptor,
    IFlowNetEntry,
    IFlowNodeOutput,
    IFlowStepDynamics,
    IFlowSubInput,
} from './flowGraphTypes';
import { layoutFlowGraph } from './layoutFlowGraph';
import { outputsSettleAsync } from './primitiveRegistry';

const STRATEGY_W = 240;
const SOURCE_W = 252;
const RECIPIENT_W = 200;

const STRATEGY_HEADER_H = 60;
const STRATEGY_BADGE_H = 28;
// Sub-input chips stack up to 3 rows (title / description / live values), so
// reserve enough vertical space that legs don't crowd the one below.
const STRATEGY_INPUT_H = 74;
const SOURCE_BASE_H = 72;
const SOURCE_BALANCE_H = 32;
const SOURCE_NET_H = 28;
/** Vertical room reserved per hub spoke (plus a top/bottom pad) so the vault's
 *  per-leg in/out anchors fan out with breathing space. The card is rendered at
 *  this full height (see EndpointCard), so anchors always land on it. */
const SOURCE_SPOKE_H = 34;
const SOURCE_SPOKE_PAD = 56;
const RECIPIENT_H = 112;

/** A token is "moving" along an edge when the producing step is active and not
 *  blocked. */
const isActive = (state: FlowRuntimeState): boolean =>
    state === 'firing' || state === 'accumulating' || state === 'done';

/** Below this (in display token units) an amount is dust — a leg "firing" on it
 *  (e.g. wrapping 1 wei of leftover stETH) moved nothing meaningful. `null` =
 *  opaque/pending, which is a genuine movement awaiting settlement. */
export const MEANINGFUL_AMOUNT_EPS = 1e-9;
const isMeaningful = (amount: number | null | undefined): boolean =>
    amount == null || Math.abs(amount) > MEANINGFUL_AMOUNT_EPS;

// Extra height for the compact params line shown under the header when a
// strategy carries config params (slippage, target token, …).
const STRATEGY_PARAMS_H = 18;

const strategyHeight = (
    inputCount: number,
    hasBadge: boolean,
    hasParams: boolean,
): number =>
    STRATEGY_HEADER_H +
    (hasBadge ? STRATEGY_BADGE_H : 0) +
    (hasParams ? STRATEGY_PARAMS_H : 0) +
    inputCount * STRATEGY_INPUT_H +
    (inputCount > 0 ? 6 : 0);

export interface IBuildFlowGraphParams {
    descriptor: IFlowMachineDescriptor;
    /** Live overlay (from the RPC snapshot) or a replayed run; null = structure
     *  only. */
    dynamics?: IFlowDynamics | null;
}

interface IStepView {
    step: IFlowMachineDescriptor['steps'][number];
    dyn: IFlowStepDynamics | undefined;
}

export const buildFlowGraph = (params: IBuildFlowGraphParams): IFlowGraph => {
    const { descriptor, dynamics } = params;

    const dynByAddress = new Map<string, IFlowStepDynamics>();
    const dynByIndex = new Map<number, IFlowStepDynamics>();
    for (const step of dynamics?.steps ?? []) {
        if (step.address) {
            dynByAddress.set(step.address.toLowerCase(), step);
        }
        dynByIndex.set(step.index, step);
    }
    const getDyn = (
        address: string,
        index: number,
    ): IFlowStepDynamics | undefined =>
        dynByAddress.get(address.toLowerCase()) ?? dynByIndex.get(index);

    const steps = [...descriptor.steps].sort((a, b) => a.index - b.index);
    const stepViews: IStepView[] = steps.map((step) => ({
        step,
        dyn: getDyn(step.address, step.index),
    }));
    const hasDynamics = stepViews.some(
        (s) => (s.dyn?.outs?.length ?? 0) > 0 || s.dyn?.ins != null,
    );

    /* ---- nodes -------------------------------------------------------- */
    const nodes: IFlowGraphNode[] = [];

    // Strategy legs, in execution order.
    for (const { step, dyn } of stepViews) {
        const inputs: IFlowSubInput[] = step.inputs.map((input, i) => {
            const reading = dyn?.inputReadings?.[i];
            return {
                role: input.role,
                kind: input.kind,
                label: input.label,
                note: input.note,
                token: reading?.token,
                reading: reading?.reading,
                detail: reading?.detail,
                status: reading?.status,
                epoch: reading?.epoch,
                epochLength: reading?.epochLength,
            };
        });
        // A leg the simulator reports as active but whose every in/out is dust
        // (e.g. wrapping 1 wei of leftover stETH) moved nothing — show it idle
        // with a no-op badge instead of a misleading "Firing 0".
        const hasFlows =
            (dyn?.ins?.length ?? 0) > 0 || (dyn?.outs?.length ?? 0) > 0;
        const movesAnything =
            (dyn?.ins ?? []).some((i) => isMeaningful(i.amount)) ||
            (dyn?.outs ?? []).some((o) => isMeaningful(o.amount));
        const rawState: FlowRuntimeState = dyn?.state ?? 'idle';
        const noOp = isActive(rawState) && hasFlows && !movesAnything;
        const state: FlowRuntimeState = noOp ? 'idle' : rawState;
        const badge = noOp ? (dyn?.badge ?? 'no budget') : dyn?.badge;
        nodes.push({
            id: step.address,
            kind: 'strategy',
            address: step.address,
            index: step.index,
            title: step.label,
            subtitle: step.subtitle,
            primitiveKind: step.kind,
            state,
            badge,
            inputs,
            params: step.params,
            x: 0,
            y: 0,
            w: STRATEGY_W,
            h: strategyHeight(
                inputs.length,
                badge != null,
                (step.params?.length ?? 0) > 0,
            ),
        });
    }

    /* ---- edges (real per-leg in/out movements) ----------------------- */
    const edges: IFlowGraphEdge[] = [];
    const sourceId = 'source';
    const recipientId = descriptor.recipient
        ? `recipient-${descriptor.recipient.address}`
        : 'recipient';
    let hasExternal = false;
    const externalProducers = new Set<string>();
    const vaultLabel = descriptor.source.label;
    const recipientLabel = descriptor.recipient?.label ?? 'Recipient';
    const outputsByStep = new Map<string, IFlowNodeOutput[]>();
    const net = new Map<string, { delta: number; opaque: boolean }>();
    const bumpNet = (token: string, signed: number, opaque: boolean): void => {
        const entry = net.get(token) ?? { delta: 0, opaque: false };
        entry.delta += signed;
        entry.opaque = entry.opaque || opaque;
        net.set(token, entry);
    };

    if (hasDynamics) {
        for (const { step, dyn } of stepViews) {
            if (!dyn) {
                continue;
            }
            const state = dyn.state ?? 'idle';
            const blocked = dyn.blocked ?? state === 'blocked';
            const flowingFeed = isActive(state) && !blocked;
            const flowingOut =
                (state === 'firing' || state === 'done') && !blocked;

            // feeds: vault → leg, one per drawn token (deduped upstream). A
            // dust / zero amount (e.g. wrapping 1 wei of leftover stETH) draws
            // no edge at all — no misleading "0" line for a leg that no-ops.
            (dyn.ins ?? []).forEach((inflow, i) => {
                if (!isMeaningful(inflow.amount)) {
                    return;
                }
                edges.push({
                    id: `feed-${step.address}-${inflow.token}-${i}`,
                    source: sourceId,
                    target: step.address,
                    kind: 'feeds',
                    token: inflow.token,
                    amount: inflow.amount,
                    fidelity: inflow.fidelity,
                    perEpoch: inflow.perEpoch,
                    flowing: flowingFeed && isMeaningful(inflow.amount),
                    blocked,
                });
                if (inflow.amount != null) {
                    bumpNet(inflow.token, -inflow.amount, false);
                } else {
                    bumpNet(inflow.token, 0, true);
                }
            });

            // returns / distributes: leg → vault (loop) or → external recipient.
            // Dust / zero outputs draw no edge (and no inspector row) either.
            // A leg whose outputs settle out-of-band (e.g. CoW buyback fill)
            // tags those edges `settle`: they render in a distinct phase and
            // don't animate as part of the dispatch "now". An explicit per-flow
            // trigger (from indexed `pending`) wins over the kind default.
            const settlesAsync = outputsSettleAsync(step.kind);
            const stepOutputs: IFlowNodeOutput[] = [];
            (dyn.outs ?? []).forEach((outflow, i) => {
                if (!isMeaningful(outflow.amount)) {
                    return;
                }
                const external = outflow.external === true;
                if (external) {
                    hasExternal = true;
                    externalProducers.add(step.address);
                }
                const trigger =
                    outflow.trigger ?? (settlesAsync ? 'settle' : 'dispatch');
                const settles = trigger === 'settle';
                edges.push({
                    id: `out-${step.address}-${outflow.token}-${i}`,
                    source: step.address,
                    target: external ? recipientId : sourceId,
                    kind: external ? 'distributes' : 'returns',
                    token: outflow.token,
                    amount: outflow.amount,
                    fidelity: outflow.fidelity,
                    perEpoch: outflow.perEpoch,
                    // Settle-phase outputs don't animate as the dispatch "now".
                    flowing:
                        flowingOut && isMeaningful(outflow.amount) && !settles,
                    blocked,
                    trigger,
                });
                stepOutputs.push({
                    token: outflow.token,
                    amount: outflow.amount,
                    fidelity: outflow.fidelity,
                    toVault: !external,
                    toLabel: external ? recipientLabel : vaultLabel,
                });
                // Proceeds looped back to the vault count toward net; genuine
                // external transfers leave the DAO, so they don't.
                if (!external) {
                    if (outflow.amount != null) {
                        bumpNet(outflow.token, outflow.amount, false);
                    } else {
                        bumpNet(outflow.token, 0, true);
                    }
                }
            });
            if (stepOutputs.length > 0) {
                outputsByStep.set(step.address, stepOutputs);
            }
        }
        for (const node of nodes) {
            const outputs = outputsByStep.get(node.id);
            if (outputs) {
                node.outputs = outputs;
            }
        }
    } else {
        // Structure-only fallback: vault funds each leg (unknown amounts).
        for (const { step } of stepViews) {
            edges.push({
                id: `feed-${step.address}`,
                source: sourceId,
                target: step.address,
                kind: 'feeds',
                fidelity: 'opaque',
                amount: null,
                flowing: false,
            });
        }
    }

    // Vault (DAO) node — the single funding source AND where proceeds land.
    const balances = dynamics?.balances ?? [];
    const netEntries: IFlowNetEntry[] = hasDynamics
        ? [...net.entries()]
              .filter(
                  ([, v]) =>
                      Math.abs(v.delta) > MEANINGFUL_AMOUNT_EPS || v.opaque,
              )
              .map(([token, v]) => ({
                  token,
                  delta: v.delta,
                  opaque: v.opaque || undefined,
              }))
        : [];
    // The vault is the hub: every feeds/returns edge attaches a spoke to it, so
    // grow the card tall enough to fan those anchors out (per-leg clusters with
    // gaps), not just to fit its balance/net content.
    const contentH =
        SOURCE_BASE_H +
        balances.length * SOURCE_BALANCE_H +
        netEntries.length * SOURCE_NET_H;
    const spokes = edges.filter(
        (e) => e.source === sourceId || e.target === sourceId,
    ).length;
    const spokeH = spokes > 0 ? SOURCE_SPOKE_PAD + spokes * SOURCE_SPOKE_H : 0;
    nodes.push({
        id: sourceId,
        kind: 'source',
        address: descriptor.source.address,
        title: descriptor.source.label,
        state: 'idle',
        inputs: [],
        balances,
        net: netEntries.length > 0 ? netEntries : undefined,
        x: 0,
        y: 0,
        w: SOURCE_W,
        h: Math.max(140, contentH, spokeH),
    });

    // External recipient — only when a leg genuinely sends out of the DAO. When
    // exactly one leg feeds it, hang it beside that leg as a satellite; when
    // several do, it stays a shared node (no `attachedTo`).
    if (hasExternal && descriptor.recipient) {
        const node = buildRecipientNode(recipientId, descriptor.recipient);
        if (externalProducers.size === 1) {
            node.attachedTo = [...externalProducers][0];
        }
        nodes.push(node);
    }

    /* ---- layout ------------------------------------------------------- */
    const result = layoutFlowGraph(nodes, edges);
    return {
        nodes: result.nodes,
        edges,
        width: result.width,
        height: result.height,
        runId: dynamics?.runId ?? null,
    };
};

const buildRecipientNode = (
    id: string,
    recipient: IFlowMachineDescriptor['recipient'],
): IFlowGraphNode => ({
    id,
    kind: 'recipient',
    address: recipient?.address,
    title: recipient?.label ?? 'Recipient',
    state: 'idle',
    inputs: [],
    x: 0,
    y: 0,
    w: RECIPIENT_W,
    h: RECIPIENT_H,
});

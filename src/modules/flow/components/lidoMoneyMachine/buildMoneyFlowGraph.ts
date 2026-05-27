// LMM_DEMO_HACK: money-flow-from-simulate.  Build a ReactFlow-compatible graph
// describing what `dispatch()` would actually do at the current chain head,
// driven by the vendored `simulate()`'s `FlowGraph`.  Mirrors the dispatch
// dialog's per-leg breakdown but laid out horizontally so the operator can
// see the value path at a glance.
//
// Production replacement: emit `ExecutionTransfer` rows with a
// `flowDirection: in|out` field (or a dedicated `MoneyFlowEdge` entity)
// from the indexer so this can be reconstructed from historical data
// without re-running `simulate()` in the browser.  See
// docs/lido-mmd-status.md row `money-flow-from-simulate`.

import type { Address } from 'viem';
import type { FlowGraph, TokenInfo } from '@/shared/lidoPreview';
import type { LmmManifest } from '../../demo/lmmDemoConfig';
import type { ReactFlowGraph } from '@/shared/lidoPreview';

const DAO_NODE = 'money/dao';

const sameAddress = (a: string | undefined, b: string | undefined): boolean =>
    a != null && b != null && a.toLowerCase() === b.toLowerCase();

/** Friendly node label for a known address from the manifest. */
const labelForAddress = (
    address: Address,
    manifest: LmmManifest | undefined,
): string => {
    if (manifest == null) {
        return shortAddress(address);
    }
    if (sameAddress(address, manifest.lmm.dao)) {
        return 'LMM DAO';
    }
    if (sameAddress(address, manifest.lido?.agent)) {
        return 'Lido Agent · LP recipient';
    }
    if (sameAddress(address, manifest.cowSwap?.settlement)) {
        return 'CowSwap settlement';
    }
    if (sameAddress(address, manifest.lido?.wstETH)) {
        return 'wstETH contract';
    }
    if (sameAddress(address, manifest.lido?.stETH)) {
        return 'stETH contract';
    }
    if (sameAddress(address, manifest.lido?.ldo)) {
        return 'LDO token';
    }
    if (sameAddress(address, manifest.lido?.uniV2Router)) {
        return 'UniV2 router';
    }
    if (sameAddress(address, manifest.lmm.dispatcherPlugin)) {
        return 'DispatcherPlugin';
    }
    return shortAddress(address);
};

const shortAddress = (a: string): string => `${a.slice(0, 6)}…${a.slice(-4)}`;

const formatTokenAmount = (amount: bigint, token: TokenInfo): string => {
    const decimals = token.decimals ?? 18;
    if (decimals <= 0) {
        return amount.toString();
    }
    const base = BigInt(10) ** BigInt(decimals);
    const whole = amount / base;
    const frac = amount % base;
    if (frac === 0n) {
        return whole.toString();
    }
    const fracStr = frac.toString().padStart(decimals, '0').slice(0, 4);
    const trimmed = fracStr.replace(/0+$/, '');
    return trimmed.length > 0 ? `${whole}.${trimmed}` : whole.toString();
};

const edgeLabel = (amount: bigint, token: TokenInfo): string => {
    const sym = token.symbol ?? shortAddress(token.address);
    return `${formatTokenAmount(amount, token)} ${sym}`;
};

const stepLabel = (kind: string): string => {
    switch (kind) {
        case 'strategy.dispatch.lido.wrap':
            return 'Wrap';
        case 'strategy.dispatch.lido.univ2-liquidity':
            return 'Add LP';
        case 'strategy.dispatch.lido.gated-cowswap':
            return 'CowSwap';
        case 'strategy.dispatch.transfer':
            return 'Transfer';
        case 'strategy.dispatch.burn':
            return 'Burn';
        case 'strategy.dispatch.epoch-transfer':
            return 'Epoch transfer';
        default:
            return kind;
    }
};

/**
 * Build a money-flow `ReactFlowGraph` from a simulated FlowGraph.  Returns
 * a structurally-empty graph when the simulator failed or every step is a
 * no-op — callers should render a "No flow available" hint in that case.
 */
export const buildMoneyFlowGraph = (
    flow: FlowGraph | null,
    manifest: LmmManifest | undefined,
): ReactFlowGraph => {
    if (flow == null) {
        return { nodes: [], edges: [] };
    }

    const nodes = new Map<string, ReactFlowGraph['nodes'][number]>();
    const edges: ReactFlowGraph['edges'] = [];
    const nodeIdForAddress = new Map<string, string>();

    const ensureAddressNode = (
        address: Address,
        type = 'money-account',
    ): string => {
        const key = address.toLowerCase();
        const existing = nodeIdForAddress.get(key);
        if (existing != null) {
            return existing;
        }
        const id = `money/addr/${key}`;
        nodes.set(id, {
            id,
            type,
            data: {
                address,
                label: labelForAddress(address, manifest),
            },
            position: { x: 0, y: 0 },
        });
        nodeIdForAddress.set(key, id);
        return id;
    };

    // Anchor DAO node first so dagre puts it leftmost.
    nodes.set(DAO_NODE, {
        id: DAO_NODE,
        type: 'money-dao',
        data: {
            address: flow.initialState.dao,
            label: labelForAddress(flow.initialState.dao, manifest),
        },
        position: { x: 0, y: 0 },
    });
    nodeIdForAddress.set(flow.initialState.dao.toLowerCase(), DAO_NODE);

    let edgeCounter = 0;
    const pushEdge = (
        source: string,
        target: string,
        label: string,
        kind: string,
    ): void => {
        edges.push({
            id: `money/edge/${edgeCounter++}`,
            source,
            target,
            label,
            type: kind,
        });
    };

    for (const step of flow.steps) {
        if (step.status !== 'executed') {
            // Surface non-executed legs as a single "skipped" edge from DAO
            // to a virtual step node so the operator sees why no value
            // flowed through that path.
            const stepNodeId = `money/step/${step.index}`;
            nodes.set(stepNodeId, {
                id: stepNodeId,
                type: 'money-step-skipped',
                data: {
                    label: `${stepLabel(step.strategyRef.kind)} · skipped`,
                    reason: step.reason,
                },
                position: { x: 0, y: 0 },
            });
            pushEdge(DAO_NODE, stepNodeId, step.reason ?? 'skipped', 'skipped');
            continue;
        }

        // 1) Transfers — explicit ERC-20 movements from DAO → recipient.
        for (const t of step.transfers) {
            const targetId = sameAddress(t.to, flow.initialState.dao)
                ? DAO_NODE
                : ensureAddressNode(t.to);
            pushEdge(
                DAO_NODE,
                targetId,
                edgeLabel(t.amount, t.token),
                'transfer',
            );
        }

        // 2) External calls — DAO → contract (consumes) and contract → DAO
        //    (produces).  Surface the call's verb (`wrap`, `swap`) as a
        //    short label on each edge so the operator can tell apart a
        //    Wrap call from a UniV2 swap.
        for (const call of step.externalCalls) {
            const verb = call.description.split('(')[0] || 'call';
            const contractId = ensureAddressNode(call.to);
            for (const c of call.consumes) {
                pushEdge(
                    DAO_NODE,
                    contractId,
                    `${verb} · ${edgeLabel(c.amount, c.token)}`,
                    'call-consumes',
                );
            }
            for (const p of call.produces) {
                pushEdge(
                    contractId,
                    DAO_NODE,
                    `${verb} · +${edgeLabel(p.amount, p.token)}`,
                    'call-produces',
                );
            }
        }
    }

    return { nodes: Array.from(nodes.values()), edges };
};

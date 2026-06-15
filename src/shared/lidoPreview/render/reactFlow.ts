// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Projection from a TopologyGraph to a React Flow-compatible `{nodes, edges}`
// graph. No layout is embedded — consumers feed this to a layout algorithm
// (dagre, elkjs, etc.) and render. The `type` field is the node's `kind` so
// consumers can style per-component.
//
// Shared infra (e.g. one EpochProvider used by both a strategy and a
// StreamUntilBudget, or a `recipient` address appearing in multiple
// splitters) is collapsed into a single node by `(kind, address)`.  This
// keeps the inspect data tree-shaped (each consumer self-introspects) while
// the projection reflects the contract reality of one shared instance.

import type {
    BudgetNode,
    EpochProviderNode,
    PluginNode,
    PriceFloorGateNode,
    SplitterNode,
    StrategyNode,
    TopologyGraph,
} from '../types/topology';

export type GraphNode = {
    id: string;
    type: string;
    data: Record<string, unknown>;
    position: { x: number; y: number };
};

export type GraphEdge = {
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
    data?: Record<string, unknown>;
};

export type ReactFlowGraph = {
    nodes: GraphNode[];
    edges: GraphEdge[];
};

type AddEdge = (
    id: string,
    source: string,
    target: string,
    label?: string,
    type?: string,
) => void;

/** A function that emits (or dedupes) a node and returns the id callers
 *  should connect edges to.  When `address` is omitted the node is treated
 *  as unique (no dedupe).  First write wins for the node data — every
 *  caller passes the same shape per `(kind, address)` by construction. */
type AddNode = (
    suggestedId: string,
    kind: string,
    address: string | undefined,
    data: Record<string, unknown>,
) => string;

/**
 * Emit a React Flow graph describing the structural topology. Node ids are
 * stable across runs (`<root>/strategies/<i>/budget`, etc.) so the UI can
 * keep selection/positions stable between re-fetches.
 */
export function toReactFlowGraph(topology: TopologyGraph): ReactFlowGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const canonical = new Map<string, string>();

    const addNode: AddNode = (suggestedId, kind, address, data) => {
        if (address !== undefined) {
            const key = `${kind}|${address.toLowerCase()}`;
            const existing = canonical.get(key);
            if (existing !== undefined) {
                return existing;
            }
            canonical.set(key, suggestedId);
        }
        nodes.push({
            id: suggestedId,
            type: kind,
            data,
            position: { x: 0, y: 0 },
        });
        return suggestedId;
    };
    const addEdge: AddEdge = (id, source, target, label, type) => {
        edges.push({
            id,
            source,
            target,
            ...(label === undefined ? {} : { label }),
            ...(type === undefined ? {} : { type }),
        });
    };

    // For DispatcherPlugin topologies, emit a DAO node as a parent of the
    // plugin so the wiring reads "DAO owns this plugin, which composes these
    // strategies."  Unknown plugins skip the DAO wrap-around (no `dao` field
    // is guaranteed).
    if (topology.root.kind === 'plugin.dispatch') {
        const daoId = addNode('root/dao', 'dao', topology.root.dao, {
            address: topology.root.dao,
        });
        const pluginId = visitPlugin(topology.root, 'root', addNode, addEdge);
        addEdge(`${daoId}->${pluginId}`, daoId, pluginId, 'owns', 'owns');
    } else {
        visitPlugin(topology.root, 'root', addNode, addEdge);
    }

    // Edges can collide when their source/target are nodes that got
    // deduplicated by `(kind, address)`.  Concrete case: a single
    // StreamUntilBudget shared between two strategies (UniV2 `budgetB` +
    // GatedCowSwap `budget` in the LMM deployment) produces the same
    // `${budgetId}->${epochProviderId}` edge twice — first emit wins, just
    // like the node dedup contract above.
    const seenEdgeIds = new Set<string>();
    const dedupedEdges = edges.filter((e) => {
        if (seenEdgeIds.has(e.id)) {
            return false;
        }
        seenEdgeIds.add(e.id);
        return true;
    });

    return { nodes, edges: dedupedEdges };
}

function visitPlugin(
    node: PluginNode,
    suggestedId: string,
    addNode: AddNode,
    addEdge: AddEdge,
): string {
    switch (node.kind) {
        case 'plugin.dispatch': {
            const id = addNode(suggestedId, node.kind, node.address, {
                address: node.address,
                pluginId: node.pluginId,
                dao: node.dao,
                strategyCount: node.strategies.length,
                failsafeStrategyMap: node.failsafeStrategyMap,
            });
            node.strategies.forEach((strategy, i) => {
                const strategyId = visitStrategy(
                    strategy,
                    `${suggestedId}/strategies/${i}`,
                    addNode,
                    addEdge,
                );
                addEdge(
                    `${id}->${strategyId}`,
                    id,
                    strategyId,
                    `[${i}]`,
                    'composes',
                );
            });
            return id;
        }
        case 'plugin.unknown':
            return addNode(suggestedId, node.kind, node.address, {
                address: node.address,
                pluginId: node.pluginId,
                dao: node.dao,
            });
    }
}

function visitStrategy(
    node: StrategyNode,
    suggestedId: string,
    addNode: AddNode,
    addEdge: AddEdge,
): string {
    // Per-kind extras: every node kind selectively contributes only the fields
    // it actually defines (no `as any` shenanigans, just a careful object
    // construction via the discriminant).
    const data: Record<string, unknown> = {
        address: node.address,
        strategyId: node.strategyId,
        paused: node.paused,
    };
    switch (node.kind) {
        case 'strategy.dispatch.transfer':
            data.useSafeTransfer = node.useSafeTransfer;
            break;
        case 'strategy.dispatch.epoch-transfer':
            data.useSafeTransfer = node.useSafeTransfer;
            data.lastDispatchedEpoch = node.lastDispatchedEpoch;
            break;
        case 'strategy.dispatch.lido.wrap':
            data.wstETH = node.wstETH;
            break;
        case 'strategy.dispatch.lido.univ2-liquidity':
            data.router = node.router;
            data.oracle = node.oracle;
            data.lpRecipient = node.lpRecipient;
            data.maxSlippageBps = node.maxSlippageBps;
            data.maxStaleness = node.maxStaleness;
            data.lastEpoch = node.lastEpoch;
            break;
        case 'strategy.dispatch.lido.gated-cowswap':
            data.targetToken = node.targetToken;
            data.cowSwapSettlement = node.cowSwapSettlement;
            data.priceOracle = node.priceOracle;
            data.maxSlippageBps = node.maxSlippageBps;
            data.maxStaleness = node.maxStaleness;
            data.useSafeApproval = node.useSafeApproval;
            data.lastEpoch = node.lastEpoch;
            break;
        case 'strategy.dispatch.burn':
        case 'strategy.unknown':
            break;
    }
    const id = addNode(suggestedId, node.kind, node.address, data);

    // Primary budget edge (every strategy except `strategy.unknown` whose
    // budget might be null).
    if ('budget' in node && node.budget) {
        const budgetId = visitBudget(
            node.budget,
            `${suggestedId}/budget`,
            addNode,
            addEdge,
        );
        addEdge(`${id}->${budgetId}`, id, budgetId, 'budget', 'reads-from');
    }
    // Secondary budget for UniV2 (LDO + wstETH stream).
    if (node.kind === 'strategy.dispatch.lido.univ2-liquidity') {
        const budgetBId = visitBudget(
            node.budgetB,
            `${suggestedId}/budgetB`,
            addNode,
            addEdge,
        );
        addEdge(`${id}->${budgetBId}`, id, budgetBId, 'budgetB', 'reads-from');
    }
    // Splitter (CR Transfer / EpochTransfer).
    if ('splitter' in node) {
        const splitterId = visitSplitter(
            node.splitter,
            `${suggestedId}/splitter`,
            addNode,
            addEdge,
        );
        addEdge(
            `${id}->${splitterId}`,
            id,
            splitterId,
            'splitter',
            'reads-from',
        );
    }
    // Soft gate (Lido GatedCowSwap).
    if (node.kind === 'strategy.dispatch.lido.gated-cowswap') {
        const gateId = visitGate(node.gate, `${suggestedId}/gate`, addNode);
        addEdge(`${id}->${gateId}`, id, gateId, 'gate', 'reads-from');
    }
    // Epoch provider.
    if ('epochProvider' in node) {
        const epochId = visitEpochProvider(
            node.epochProvider,
            `${suggestedId}/epochProvider`,
            addNode,
        );
        addEdge(`${id}->${epochId}`, id, epochId, 'epoch', 'reads-from');
    }
    return id;
}

function visitBudget(
    node: BudgetNode,
    suggestedId: string,
    addNode: AddNode,
    addEdge: AddEdge,
): string {
    const data: Record<string, unknown> = {
        address: node.address,
        budgetId: node.budgetId,
        token: node.token,
    };
    switch (node.kind) {
        case 'budget.full':
            data.vault = node.vault;
            break;
        case 'budget.required':
            data.vault = node.vault;
            data.requiredAmount = node.requiredAmount;
            break;
        case 'budget.lido.stream-until':
            data.vault = node.vault;
            data.targetEpoch = node.targetEpoch;
            data.floorEpochs = node.floorEpochs;
            break;
        case 'budget.unknown':
            break;
    }
    const id = addNode(suggestedId, node.kind, node.address, data);

    // The StreamUntil budget reads from an epoch provider — surface that edge
    // so the topology shows what drives the per-tick share.
    if (node.kind === 'budget.lido.stream-until') {
        const epochId = visitEpochProvider(
            node.epochProvider,
            `${suggestedId}/epochProvider`,
            addNode,
        );
        addEdge(`${id}->${epochId}`, id, epochId, 'epoch', 'reads-from');
    }
    return id;
}

function visitGate(
    node: PriceFloorGateNode,
    suggestedId: string,
    addNode: AddNode,
): string {
    return addNode(suggestedId, node.kind, node.address, {
        address: node.address,
        vault: node.vault,
        oracle: node.oracle,
        tokenA: node.tokenA,
        tokenB: node.tokenB,
        threshold: node.threshold,
        maxStaleness: node.maxStaleness,
    });
}

function visitSplitter(
    node: SplitterNode,
    suggestedId: string,
    addNode: AddNode,
    addEdge: AddEdge,
): string {
    const id = addNode(suggestedId, node.kind, node.address, {
        address: node.address,
        splitterId: node.splitterId,
        ...('recipient' in node ? { recipient: node.recipient } : {}),
        ...('recipients' in node ? { recipients: node.recipients } : {}),
        ...('entries' in node ? { entries: node.entries } : {}),
    });

    // Emit recipient nodes + distribution edges so a UI can draw money flow
    // at the topology level (amounts come from FlowGraph at runtime).
    if (node.kind === 'splitter.solo') {
        const recipientId = addNode(
            `${suggestedId}/recipient`,
            'recipient',
            node.recipient,
            { address: node.recipient },
        );
        addEdge(
            `${id}->${recipientId}`,
            id,
            recipientId,
            '100%',
            'distributes-to',
        );
    } else if (node.kind === 'splitter.equal') {
        const share =
            node.recipients.length > 0
                ? `${(100 / node.recipients.length).toFixed(2)}%`
                : '—';
        node.recipients.forEach((recipient, i) => {
            const rid = addNode(
                `${suggestedId}/recipients/${i}`,
                'recipient',
                recipient,
                { address: recipient },
            );
            addEdge(`${id}->${rid}`, id, rid, share, 'distributes-to');
        });
    } else if (node.kind === 'splitter.ratio') {
        node.entries.forEach(({ recipient, ratio }, i) => {
            const rid = addNode(
                `${suggestedId}/recipients/${i}`,
                'recipient',
                recipient,
                { address: recipient },
            );
            addEdge(
                `${id}->${rid}`,
                id,
                rid,
                `${(ratio / 10_000).toFixed(2)}%`,
                'distributes-to',
            );
        });
    }
    return id;
}

function visitEpochProvider(
    node: EpochProviderNode,
    suggestedId: string,
    addNode: AddNode,
): string {
    return addNode(suggestedId, node.kind, node.address, {
        address: node.address,
        currentEpoch: node.currentEpoch,
    });
}

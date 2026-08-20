import dagre from '@dagrejs/dagre';
import type { Edge, Node } from '@xyflow/react';
import type {
    IMpcPolicyCatalogTemplate,
    IMpcPolicyCheckResult,
    IMpcPolicyFlow,
    IMpcPolicyFlowEdge,
    IMpcPolicyFlowNode,
    IMpcPolicySimResult,
    IMpcWorkspacePolicy,
    MpcPolicyFlowBranch,
} from '@/modules/mpc/api/mpcService/domain';
import type { ITFuncOptions } from '@/shared/utils/translationsUtils';
import { formatDurationSeconds, localizedText } from './mpcPolicyEditorText';

/**
 * Adapter between the engine flow format (decision tree: trigger -> conditions -> actions) and React Flow
 * nodes / edges, plus the dagre layout and the simulation / check overlays.
 */

export type MpcPolicyEditorTranslate = (
    key: string,
    options?: ITFuncOptions,
) => string;

export type MpcPolicyEditorNodeKind = 'trigger' | 'condition' | 'action';

export interface IMpcPolicyEditorNodeData extends Record<string, unknown> {
    kind: MpcPolicyEditorNodeKind;
    template?: string;
    templateLabel: string;
    isEffectful: boolean;
    params: Record<string, unknown>;
    paramSummary: string[];
    /**
     * Simulation overlay state.
     */
    sim?: 'on' | 'true' | 'false' | 'decision' | 'dim';
    branchTaken?: MpcPolicyFlowBranch;
    simNote?: string;
    /**
     * Formal check overlay state (error wins over warning).
     */
    check?: 'error' | 'warning';
}

export type MpcPolicyEditorNode = Node<IMpcPolicyEditorNodeData>;
export type MpcPolicyEditorEdge = Edge;

export interface IMpcPolicyCatalogIndex {
    conditions: Map<string, IMpcPolicyCatalogTemplate>;
    actions: Map<string, IMpcPolicyCatalogTemplate>;
}

/**
 * Template id of the "policy block": an action leaf delegating the decision to another saved policy of the
 * workspace (params: `{ policyId }`). Not a catalog block: the co-signer inlines it before the engine runs.
 */
export const MPC_POLICY_REF_TEMPLATE = 'policy_ref';

/**
 * Synthetic catalog template of a policy block, so the editor treats it like any other block.
 */
export const policyRefTemplate = (
    policy: Pick<IMpcWorkspacePolicy, 'id' | 'name'>,
    t: MpcPolicyEditorTranslate,
): IMpcPolicyCatalogTemplate => ({
    id: MPC_POLICY_REF_TEMPLATE,
    version: 1,
    kind: 'action',
    class: 'deterministic',
    label: t('app.mpc.mpcPolicyEditor.policyRef.label', { name: policy.name }),
    description: t('app.mpc.mpcPolicyEditor.policyRef.description'),
    params: [
        {
            name: 'policyId',
            type: 'policy_ref',
            label: t('app.mpc.mpcPolicyEditor.policyRef.paramLabel'),
            default: policy.id,
        },
    ],
});

export const EMPTY_POLICY_FLOW: IMpcPolicyFlow = {
    flowVersion: 1,
    nodes: [{ id: 'trigger', type: 'trigger' }],
    edges: [],
};

export const indexCatalog = (
    conditions: IMpcPolicyCatalogTemplate[],
    actions: IMpcPolicyCatalogTemplate[],
): IMpcPolicyCatalogIndex => ({
    conditions: new Map(conditions.map((item) => [item.id, item])),
    actions: new Map(actions.map((item) => [item.id, item])),
});

export const templateFor = (
    index: IMpcPolicyCatalogIndex,
    kind: string,
    template?: string,
): IMpcPolicyCatalogTemplate | undefined => {
    if (template == null) {
        return undefined;
    }

    return kind === 'action'
        ? index.actions.get(template)
        : index.conditions.get(template);
};

/**
 * Default parameter values of a block, derived from the catalog definition.
 */
export const defaultParams = (
    template: IMpcPolicyCatalogTemplate,
): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const param of template.params) {
        if (param.default !== undefined) {
            result[param.name] = param.default;
        } else if (param.type === 'bool') {
            result[param.name] = false;
        } else if (param.type === 'enum' && param.values?.length) {
            result[param.name] = param.values[0];
        } else if (param.type === 'multiselect') {
            result[param.name] = [];
        } else if (param.type === 'decimal' || param.type === 'biguint') {
            result[param.name] = '0';
        } else if (param.type === 'int' || param.type === 'duration') {
            result[param.name] = param.min ?? 0;
        } else {
            result[param.name] = '';
        }
    }

    return result;
};

const ACTION_DOT_CLASS: Record<string, string> = {
    approve: 'dot-success',
    escalate: 'dot-warning',
    deny: 'dot-critical',
    notify: 'dot-neutral',
};

export const actionDotClass = (template?: string): string =>
    (template != null ? ACTION_DOT_CLASS[template] : undefined) ??
    (template === MPC_POLICY_REF_TEMPLATE ? 'dot-primary' : 'dot-neutral');

export const templateLabelFor = (
    index: IMpcPolicyCatalogIndex,
    kind: string,
    template: string | undefined,
    t: MpcPolicyEditorTranslate,
): string => {
    const catalogTemplate = templateFor(index, kind, template);

    if (catalogTemplate != null) {
        return localizedText(catalogTemplate.label);
    }

    if (kind === 'trigger') {
        return t('app.mpc.mpcPolicyEditor.node.triggerLabel');
    }

    if (template === MPC_POLICY_REF_TEMPLATE) {
        return t('app.mpc.mpcPolicyEditor.policyRef.nodeTitle');
    }

    return template ?? '';
};

export const branchLabel = (
    branch: string | null | undefined,
    t: MpcPolicyEditorTranslate,
): string | undefined => {
    if (branch === 'true') {
        return t('app.mpc.mpcPolicyEditor.yes');
    }

    if (branch === 'false') {
        return t('app.mpc.mpcPolicyEditor.no');
    }

    return undefined;
};

const OPERATOR_SYMBOL: Record<string, string> = {
    lt: '<',
    lte: '≤',
    gte: '≥',
    gt: '>',
};

/**
 * Short human readable summary of the block parameters (rendered inside the node).
 */
export const paramSummary = (
    kind: string,
    template: string | undefined,
    params: Record<string, unknown>,
    index: IMpcPolicyCatalogIndex,
    t: MpcPolicyEditorTranslate,
    policyNames?: Map<string, string>,
): string[] => {
    if (template === MPC_POLICY_REF_TEMPLATE) {
        const policyId = String(params.policyId ?? '');

        return [
            policyNames?.get(policyId) ??
                t('app.mpc.mpcPolicyEditor.policyRef.unknown'),
        ];
    }

    const catalogTemplate = templateFor(index, kind, template);

    if (catalogTemplate == null || catalogTemplate.params.length === 0) {
        return [];
    }

    return catalogTemplate.params
        .map((param) => {
            const value = params[param.name];
            const label =
                param.label != null ? localizedText(param.label) : param.name;

            if (template === 'amount_threshold') {
                if (param.name === 'operator') {
                    return t('app.mpc.mpcPolicyEditor.summary.amount', {
                        op: OPERATOR_SYMBOL[String(value)] ?? String(value),
                        value: String(params.amount_eth),
                    });
                }

                if (param.name === 'amount_eth') {
                    return '';
                }
            }

            if (template === 'token_amount_threshold') {
                if (param.name === 'operator') {
                    return t('app.mpc.mpcPolicyEditor.summary.tokenAmount', {
                        op: OPERATOR_SYMBOL[String(value)] ?? String(value),
                        value: String(params.amount_units),
                    });
                }

                if (
                    param.name === 'amount_units' ||
                    param.name === 'decimals_hint'
                ) {
                    return '';
                }
            }

            if (template === 'proposal_kind' && param.name === 'kind') {
                return t('app.mpc.mpcPolicyEditor.summary.kind', {
                    value: String(value),
                });
            }

            if (param.type === 'bool') {
                return `${label}: ${t(value ? 'app.mpc.mpcPolicyEditor.yes' : 'app.mpc.mpcPolicyEditor.no')}`;
            }

            if (param.type === 'multiselect' && Array.isArray(value)) {
                return `${label}: ${value.join(', ')}`;
            }

            if (param.type === 'duration') {
                return `${label}: ${formatDurationSeconds(
                    Number(value),
                    t('app.mpc.mpcPolicyEditor.duration.none'),
                )}`;
            }

            return `${label}: ${String(value)}`;
        })
        .filter((item) => item.length > 0);
};

// ---- Layout: dagre (left -> right) + "yes above / no below" post-process ----

const branchRank = (branch?: string): number =>
    branch === 'true' ? 0 : branch === 'false' ? 1 : -1;

/**
 * Pre-order DFS from the trigger (true before false) to group branches vertically.
 */
const dfsOrder = (flow: IMpcPolicyFlow): Map<string, number> => {
    const bySource = new Map<string, IMpcPolicyFlowEdge[]>();

    for (const edge of flow.edges) {
        const list = bySource.get(edge.from) ?? [];
        list.push(edge);
        bySource.set(edge.from, list);
    }

    const order = new Map<string, number>();
    const seen = new Set<string>();
    let counter = 0;

    const visit = (id: string) => {
        if (seen.has(id)) {
            return;
        }

        seen.add(id);
        order.set(id, counter++);
        const outs = [...(bySource.get(id) ?? [])].sort(
            (a, b) => branchRank(a.branch) - branchRank(b.branch),
        );

        for (const edge of outs) {
            visit(edge.to);
        }
    };

    const trigger = flow.nodes.find((node) => node.type === 'trigger');

    if (trigger != null) {
        visit(trigger.id);
    }

    for (const node of flow.nodes) {
        if (!order.has(node.id)) {
            order.set(node.id, counter++);
        }
    }

    return order;
};

const estimateSize = (
    node: IMpcPolicyFlowNode,
): { width: number; height: number } => {
    if (node.type === 'trigger') {
        return { width: 200, height: 46 };
    }

    if (node.type === 'action') {
        return { width: 220, height: 78 };
    }

    return { width: 220, height: 96 };
};

/**
 * Layered layout (dagre, LR) honouring real node sizes, followed by a pass that swaps disjoint "yes" / "no"
 * subtrees so the "yes" branch is always rendered above the "no" branch.
 */
export const layoutFlow = (
    flow: IMpcPolicyFlow,
    sizes?: Map<string, { width: number; height: number }>,
): Map<string, { x: number; y: number }> => {
    const graph = new dagre.graphlib.Graph();
    graph.setGraph({
        rankdir: 'LR',
        nodesep: 36,
        ranksep: 90,
        edgesep: 24,
        marginx: 40,
        marginy: 40,
    });
    graph.setDefaultEdgeLabel(() => ({}));

    const order = dfsOrder(flow);
    const nodesById = new Map(flow.nodes.map((node) => [node.id, node]));
    const sizeOf = (id: string) =>
        sizes?.get(id) ?? estimateSize(nodesById.get(id)!);

    for (const node of flow.nodes) {
        const size = sizeOf(node.id);
        graph.setNode(node.id, {
            width: size.width,
            height: size.height,
            order: order.get(node.id) ?? 0,
        });
    }

    const edges = [...flow.edges].sort(
        (a, b) =>
            branchRank(a.branch) - branchRank(b.branch) ||
            (order.get(a.to) ?? 0) - (order.get(b.to) ?? 0),
    );

    for (const edge of edges) {
        graph.setEdge(edge.from, edge.to);
    }

    dagre.layout(graph);

    const center = new Map<string, { x: number; y: number }>();

    for (const node of flow.nodes) {
        const laidOut = graph.node(node.id);

        if (laidOut != null) {
            center.set(node.id, { x: laidOut.x, y: laidOut.y });
        }
    }

    // "yes above / no below": dagre does not know branch semantics.
    const children = new Map<string, { yes?: string; no?: string }>();
    const successors = new Map<string, string[]>();

    for (const edge of flow.edges) {
        const entry = children.get(edge.from) ?? {};

        if (edge.branch === 'true') {
            entry.yes = edge.to;
        } else if (edge.branch === 'false') {
            entry.no = edge.to;
        }

        children.set(edge.from, entry);
        successors.set(edge.from, [
            ...(successors.get(edge.from) ?? []),
            edge.to,
        ]);
    }

    const subtree = (root: string): Set<string> => {
        const result = new Set<string>();
        const stack = [root];

        while (stack.length > 0) {
            const id = stack.pop()!;

            if (result.has(id)) {
                continue;
            }

            result.add(id);
            stack.push(...(successors.get(id) ?? []));
        }

        return result;
    };

    const shiftY = (ids: Set<string>, dy: number) => {
        for (const id of ids) {
            const position = center.get(id);

            if (position != null) {
                center.set(id, { x: position.x, y: position.y + dy });
            }
        }
    };

    const box = (ids: Set<string>) => {
        let top = Number.POSITIVE_INFINITY;
        let bottom = Number.NEGATIVE_INFINITY;

        for (const id of ids) {
            const position = center.get(id);

            if (position == null) {
                continue;
            }

            const height = sizeOf(id).height;
            top = Math.min(top, position.y - height / 2);
            bottom = Math.max(bottom, position.y + height / 2);
        }

        return { top, bottom };
    };

    const conditions = flow.nodes
        .filter(
            (node) =>
                node.type === 'condition' &&
                children.get(node.id)?.yes != null &&
                children.get(node.id)?.no != null,
        )
        .sort(
            (a, b) => (center.get(a.id)?.x ?? 0) - (center.get(b.id)?.x ?? 0),
        );

    for (const condition of conditions) {
        const { yes, no } = children.get(condition.id)!;
        const yesTree = subtree(yes!);
        const noTree = subtree(no!);
        const shared = [...yesTree].some((id) => noTree.has(id));

        if (shared) {
            continue;
        }

        const yesY = center.get(yes!)?.y ?? 0;
        const noY = center.get(no!)?.y ?? 0;

        if (yesY > noY) {
            const yesBox = box(yesTree);
            const noBox = box(noTree);
            shiftY(yesTree, noBox.top - yesBox.top);
            const yesBoxAfter = box(yesTree);
            const noBoxAfter = box(noTree);
            shiftY(noTree, yesBoxAfter.bottom + 36 - noBoxAfter.top);
        }
    }

    const positions = new Map<string, { x: number; y: number }>();

    for (const node of flow.nodes) {
        const position = center.get(node.id);

        if (position == null) {
            continue;
        }

        const size = sizeOf(node.id);
        // dagre returns the center; React Flow expects the top-left corner.
        positions.set(node.id, {
            x: position.x - size.width / 2,
            y: position.y - size.height / 2,
        });
    }

    return positions;
};

// ---- Edge styling (one helper used on load and on manual connect) ----

export const EDGE_COLORS = {
    yes: '#8ecc0a',
    no: '#f93636',
    neutral: '#9aa5b1',
} as const;

export const edgeStyleFor = (branch?: string | null) => {
    const stroke =
        branch === 'true'
            ? EDGE_COLORS.yes
            : branch === 'false'
              ? EDGE_COLORS.no
              : EDGE_COLORS.neutral;

    return {
        style: { stroke, strokeWidth: 1.8 },
        labelStyle: { fontSize: 10, fontWeight: 600, fill: stroke },
        labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
    };
};

// ---- Flow <-> React Flow ----

export const flowToReactFlow = (
    flow: IMpcPolicyFlow,
    index: IMpcPolicyCatalogIndex,
    t: MpcPolicyEditorTranslate,
    policyNames?: Map<string, string>,
): { nodes: MpcPolicyEditorNode[]; edges: MpcPolicyEditorEdge[] } => {
    const positions = layoutFlow(flow);
    const nodes: MpcPolicyEditorNode[] = flow.nodes.map((node) => {
        const catalogTemplate = templateFor(index, node.type, node.template);
        const params = node.params ?? {};

        return {
            id: node.id,
            type: node.type,
            position: positions.get(node.id) ?? { x: 0, y: 0 },
            data: {
                kind: node.type,
                template: node.template,
                templateLabel:
                    templateLabelFor(index, node.type, node.template, t) ||
                    node.id,
                isEffectful: catalogTemplate?.class === 'effectful',
                params,
                paramSummary: paramSummary(
                    node.type,
                    node.template,
                    params,
                    index,
                    t,
                    policyNames,
                ),
            },
        };
    });
    const edges: MpcPolicyEditorEdge[] = flow.edges.map((edge, i) => ({
        id: `e${i.toString()}-${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        sourceHandle: edge.branch ?? 'out',
        targetHandle: 'in',
        label: branchLabel(edge.branch, t),
        ...edgeStyleFor(edge.branch),
    }));

    return { nodes, edges };
};

export const reactFlowToFlow = (
    nodes: MpcPolicyEditorNode[],
    edges: MpcPolicyEditorEdge[],
    name?: IMpcPolicyFlow['name'],
): IMpcPolicyFlow => ({
    flowVersion: 1,
    ...(name != null && name !== '' ? { name } : {}),
    nodes: nodes.map((node) => {
        const base: IMpcPolicyFlowNode = { id: node.id, type: node.data.kind };

        if (node.data.kind !== 'trigger') {
            base.template = node.data.template;
            base.params = node.data.params;
        }

        return base;
    }),
    edges: edges.map((edge) => {
        const branch: MpcPolicyFlowBranch | undefined =
            edge.sourceHandle === 'true'
                ? 'true'
                : edge.sourceHandle === 'false'
                  ? 'false'
                  : undefined;
        const result: IMpcPolicyFlowEdge = {
            from: edge.source,
            to: edge.target,
        };

        if (branch != null) {
            result.branch = branch;
        }

        return result;
    }),
});

// ---- Overlays ----

/**
 * Marks every node with the worst severity of the issues referencing it (error wins over warning).
 */
export const applyCheckOverlay = (
    nodes: MpcPolicyEditorNode[],
    result: IMpcPolicyCheckResult | null,
): MpcPolicyEditorNode[] => {
    if (result == null) {
        return nodes.map((node) =>
            node.data.check != null
                ? { ...node, data: { ...node.data, check: undefined } }
                : node,
        );
    }

    const level = new Map<string, 'error' | 'warning'>();

    for (const issue of result.issues) {
        for (const id of issue.nodes) {
            const previous = level.get(id);

            if (issue.severity === 'error' || previous !== 'error') {
                level.set(id, issue.severity);
            }
        }
    }

    return nodes.map((node) => {
        const check = level.get(node.id);

        return node.data.check === check
            ? node
            : { ...node, data: { ...node.data, check } };
    });
};

export const applySimulationOverlay = (
    nodes: MpcPolicyEditorNode[],
    result: IMpcPolicySimResult | null,
): MpcPolicyEditorNode[] => {
    if (result == null) {
        return nodes.map((node) =>
            node.data.sim != null ||
            node.data.branchTaken != null ||
            node.data.simNote != null
                ? {
                      ...node,
                      data: {
                          ...node.data,
                          sim: undefined,
                          branchTaken: undefined,
                          simNote: undefined,
                      },
                  }
                : node,
        );
    }

    const pathSet = new Set(result.path);

    return nodes.map((node) => {
        let sim: IMpcPolicyEditorNodeData['sim'] = pathSet.has(node.id)
            ? 'on'
            : 'dim';
        let branchTaken: MpcPolicyFlowBranch | undefined;
        let simNote: string | undefined;
        const nodeResult = result.nodeResults[node.id];

        if (nodeResult != null) {
            sim = nodeResult.took === 'true' ? 'true' : 'false';
            branchTaken = nodeResult.took;
            simNote = nodeResult.note;
        }

        if (node.id === result.actionNodeId) {
            sim = 'decision';
        }

        return { ...node, data: { ...node.data, sim, branchTaken, simNote } };
    });
};

/**
 * Counts the templates used by a flow (for list cards: "3 conditions · 2 actions").
 */
export const countFlowBlocks = (
    flow: IMpcPolicyFlow,
): { conditions: number; actions: number } => ({
    conditions: flow.nodes.filter((node) => node.type === 'condition').length,
    actions: flow.nodes.filter((node) => node.type === 'action').length,
});

import 'server-only';
import type {
    IMpcPolicyCheckResult,
    IMpcPolicyFlow,
    IMpcPolicyFlowEdge,
    IMpcPolicyFlowNode,
    IMpcPolicySimResult,
} from '@/modules/mpc/api/mpcService/domain';
import { MpcApiError } from './mpcApiError';
import type { IMpcStoreData } from './mpcStore';

/**
 * "Policy blocks": a flow may use another saved policy of the same workspace as a leaf block (template
 * `policy_ref`, params `{ policyId }`): the decision of the referenced policy becomes the decision of that
 * branch. The engine only knows catalog blocks, so references are inlined (the referenced tree replaces the
 * block, node ids prefixed with `<blockId>::`) before check / evaluate, and the results are mapped back to
 * the block id so the editor highlights the block. Cycles and unknown references are refused.
 */

export const MPC_POLICY_REF_TEMPLATE = 'policy_ref';

const MAX_REFERENCE_DEPTH = 8;
const ID_SEPARATOR = '::';

export const isPolicyRefNode = (node: IMpcPolicyFlowNode): boolean =>
    node.template === MPC_POLICY_REF_TEMPLATE;

export const policyRefTarget = (
    node: IMpcPolicyFlowNode,
): string | undefined => {
    const value = node.params?.policyId;

    return typeof value === 'string' && value.length > 0 ? value : undefined;
};

/**
 * Ids of the policies referenced (directly) by a flow.
 */
export const referencedPolicyIds = (flow: IMpcPolicyFlow): string[] =>
    Array.from(
        new Set(
            flow.nodes
                .filter(isPolicyRefNode)
                .map(policyRefTarget)
                .filter((id): id is string => id != null),
        ),
    );

export interface IMpcExpandedFlow {
    /**
     * Flow with every policy block replaced by the referenced tree (catalog blocks only).
     */
    flow: IMpcPolicyFlow;
    /**
     * Whether the flow contained policy blocks.
     */
    hasReferences: boolean;
    /**
     * Maps an expanded node id back to the id of the top-level node (the policy block for inlined nodes).
     */
    mapNodeId: (id: string) => string;
    mapCheckResult: (result: IMpcPolicyCheckResult) => IMpcPolicyCheckResult;
    mapSimResult: (result: IMpcPolicySimResult) => IMpcPolicySimResult;
}

const mapId = (id: string): string => {
    const index = id.indexOf(ID_SEPARATOR);

    return index === -1 ? id : id.slice(0, index);
};

const expand = (
    data: IMpcStoreData,
    workspaceId: string,
    flow: IMpcPolicyFlow,
    stack: string[],
): {
    nodes: IMpcPolicyFlowNode[];
    edges: IMpcPolicyFlowEdge[];
    hasReferences: boolean;
} => {
    if (stack.length > MAX_REFERENCE_DEPTH) {
        throw new MpcApiError(
            'validation_error',
            `Policy blocks are nested too deeply (max ${MAX_REFERENCE_DEPTH.toString()} levels).`,
        );
    }

    let nodes: IMpcPolicyFlowNode[] = [];
    let edges: IMpcPolicyFlowEdge[] = [...flow.edges];
    let hasReferences = false;

    for (const node of flow.nodes) {
        if (!isPolicyRefNode(node)) {
            nodes.push(node);
            continue;
        }

        hasReferences = true;
        const targetId = policyRefTarget(node);
        const target =
            targetId != null
                ? data.workspacePolicies.find(
                      (item) =>
                          item.id === targetId &&
                          item.workspaceId === workspaceId,
                  )
                : undefined;

        if (target == null) {
            throw new MpcApiError(
                'validation_error',
                `The policy block "${node.id}" references a policy that does not exist in this workspace.`,
            );
        }

        if (stack.includes(target.id)) {
            throw new MpcApiError(
                'validation_error',
                `The policy block "${node.id}" creates a cycle: "${target.name}" (directly or indirectly) references this policy.`,
            );
        }

        const inner = expand(data, workspaceId, target.flow, [
            ...stack,
            target.id,
        ]);
        const prefix = `${node.id}${ID_SEPARATOR}`;
        const innerTrigger = inner.nodes.find(
            (item) => item.type === 'trigger',
        );
        const entryEdge = inner.edges.find(
            (edge) => innerTrigger != null && edge.from === innerTrigger.id,
        );

        // Inline: every inner node except the trigger, ids prefixed with the block id.
        nodes = nodes.concat(
            inner.nodes
                .filter((item) => item.type !== 'trigger')
                .map((item) => ({ ...item, id: `${prefix}${item.id}` })),
        );
        const innerEdges = inner.edges
            .filter(
                (edge) => innerTrigger == null || edge.from !== innerTrigger.id,
            )
            .map((edge) => ({
                ...edge,
                from: `${prefix}${edge.from}`,
                to: `${prefix}${edge.to}`,
            }));

        // Redirect the edges pointing at the block to the entry of the inlined tree (or drop them when the
        // referenced policy is empty: the branch then falls into the default deny).
        edges = edges
            .flatMap((edge) =>
                edge.to === node.id
                    ? entryEdge != null
                        ? [{ ...edge, to: `${prefix}${entryEdge.to}` }]
                        : []
                    : [edge],
            )
            .concat(innerEdges);
    }

    return { nodes, edges, hasReferences };
};

/**
 * Expands the policy blocks of a flow of the workspace. `selfPolicyId` is the policy being saved (a policy
 * cannot reference itself, directly or through other policies).
 */
export const expandPolicyReferences = (
    data: IMpcStoreData,
    workspaceId: string,
    flow: IMpcPolicyFlow,
    selfPolicyId?: string,
): IMpcExpandedFlow => {
    const expanded = expand(
        data,
        workspaceId,
        flow,
        selfPolicyId != null ? [selfPolicyId] : [],
    );
    const result: IMpcPolicyFlow = {
        ...flow,
        nodes: expanded.nodes,
        edges: expanded.edges,
    };

    return {
        flow: result,
        hasReferences: expanded.hasReferences,
        mapNodeId: mapId,
        mapCheckResult: (check) => ({
            ...check,
            issues: check.issues.map((issue) => ({
                ...issue,
                nodes: Array.from(new Set(issue.nodes.map(mapId))),
            })),
        }),
        mapSimResult: (sim) => {
            const path: string[] = [];

            for (const id of sim.path.map(mapId)) {
                if (path.at(-1) !== id) {
                    path.push(id);
                }
            }

            const nodeResults: IMpcPolicySimResult['nodeResults'] = {};

            for (const [id, value] of Object.entries(sim.nodeResults)) {
                if (!id.includes(ID_SEPARATOR)) {
                    nodeResults[id] = value;
                }
            }

            return {
                ...sim,
                path,
                nodeResults,
                actionNodeId:
                    sim.actionNodeId != null ? mapId(sim.actionNodeId) : null,
            };
        },
    };
};

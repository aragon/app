import { addressUtils } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type {
    IFlowPolicy,
    IFlowPolicySubRouter,
    IFlowRecipient,
} from '../../types';

export interface IFlowPolicyTreeProps {
    policy: IFlowPolicy;
    className?: string;
}

type NodeType = 'source' | 'router' | 'leaf';

interface ITreeNode {
    id: string;
    type: NodeType;
    title: string;
    subtitle?: string;
    edgeLabel?: string;
    children: ITreeNode[];
    col: number;
    row: number;
    parentId?: string;
}

const NODE_WIDTH = 184;
const NODE_HEIGHT = 64;
const COL_GAP = 56;
const ROW_GAP = 16;
const PAD = 16;

const extractEdgeLabel = (subtitle: string | undefined): string | undefined => {
    if (subtitle == null) {
        return undefined;
    }
    const match = subtitle.match(/(\d+(?:\.\d+)?\s*%)/);
    return match?.[1];
};

const splitSource = (source: string): { title: string; subtitle?: string } => {
    const idx = source.indexOf('·');
    if (idx === -1) {
        return { title: source };
    }
    return {
        title: source.slice(0, idx).trim(),
        subtitle: source.slice(idx + 1).trim(),
    };
};

const buildRecipientNode = (
    recipient: IFlowRecipient,
    parentId: string,
    index: number,
): ITreeNode => ({
    id: `${parentId}:leaf-${index}-${recipient.address}`,
    type: 'leaf',
    // `recipient.name` is already a known label (address book hit) or a truncated
    // fallback — SVG tree nodes can't host React components so ENS enrichment has
    // to skip this view; subtitle shows the truncated hex for copy/paste.
    title: recipient.ens ?? recipient.name,
    subtitle: addressUtils.truncateAddress(recipient.address),
    edgeLabel:
        recipient.ratio ??
        (recipient.pct != null ? `${recipient.pct}%` : undefined),
    children: [],
    parentId,
    col: 0,
    row: 0,
});

const buildRouterNode = (
    router: IFlowPolicySubRouter,
    parentId: string,
): ITreeNode => {
    const node: ITreeNode = {
        id: router.id,
        type: 'router',
        title: router.title,
        subtitle: router.model?.type ?? router.subtitle,
        edgeLabel: extractEdgeLabel(router.subtitle),
        children: [],
        parentId,
        col: 0,
        row: 0,
    };
    const recipients = router.recipients ?? [];
    const nestedRouters = router.subRouters ?? [];
    node.children = [
        ...nestedRouters.map((r) => buildRouterNode(r, node.id)),
        ...recipients.map((r, i) => buildRecipientNode(r, node.id, i)),
    ];
    return node;
};

const buildTree = (policy: IFlowPolicy): ITreeNode => {
    const { title, subtitle } = splitSource(policy.schema.source);
    const root: ITreeNode = {
        id: `${policy.id}:source`,
        type: 'source',
        title: title || policy.name,
        subtitle: subtitle ?? `${policy.strategy} policy`,
        children: [],
        col: 0,
        row: 0,
    };
    const subRouters = policy.schema.subRouters ?? [];
    root.children = subRouters.map((r) => buildRouterNode(r, root.id));
    return root;
};

/**
 * Recursively assign columns and rows so leaves advance a shared counter and
 * each parent sits at the midpoint between its first and last child. Produces
 * a deterministic, compact layout without requiring post-pass compaction.
 */
const layoutTree = (root: ITreeNode): { cols: number; rows: number } => {
    let leafCursor = 0;
    let maxDepth = 0;

    const walk = (node: ITreeNode, depth: number): void => {
        node.col = depth;
        maxDepth = Math.max(maxDepth, depth);
        if (node.children.length === 0) {
            node.row = leafCursor;
            leafCursor += 1;
            return;
        }
        node.children.forEach((child) => walk(child, depth + 1));
        const childRows = node.children.map((c) => c.row);
        node.row = (Math.min(...childRows) + Math.max(...childRows)) / 2;
    };

    walk(root, 0);
    return { cols: maxDepth + 1, rows: Math.max(leafCursor, 1) };
};

const flatten = (root: ITreeNode): ITreeNode[] => {
    const out: ITreeNode[] = [];
    const stack: ITreeNode[] = [root];
    while (stack.length > 0) {
        const n = stack.pop()!;
        out.push(n);
        for (const child of n.children) {
            stack.push(child);
        }
    }
    return out;
};

const nodeTypeClass: Record<NodeType, string> = {
    source: 'border-primary-300 bg-primary-50',
    router: 'border-neutral-200 bg-neutral-0',
    leaf: 'border-neutral-100 bg-neutral-50',
};

const nodeTypeTagClass: Record<NodeType, string> = {
    source: 'text-primary-700',
    router: 'text-neutral-500',
    leaf: 'text-neutral-500',
};

const nodeTypeLabel: Record<NodeType, string> = {
    source: 'SOURCE',
    router: 'ROUTER',
    leaf: 'RECIPIENT',
};

export const FlowPolicyTree: React.FC<IFlowPolicyTreeProps> = (props) => {
    const { policy, className } = props;

    const root = buildTree(policy);
    const { cols, rows } = layoutTree(root);
    const nodes = flatten(root);

    const width = PAD * 2 + cols * NODE_WIDTH + (cols - 1) * COL_GAP;
    const height = PAD * 2 + rows * NODE_HEIGHT + (rows - 1) * ROW_GAP;

    const nodeX = (col: number) => PAD + col * (NODE_WIDTH + COL_GAP);
    const nodeY = (row: number) => PAD + row * (NODE_HEIGHT + ROW_GAP);

    const byId = new Map(nodes.map((n) => [n.id, n]));

    return (
        <div
            className={classNames(
                'flex flex-col gap-2 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:p-6',
                className,
            )}
        >
            <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-base text-neutral-800 leading-tight">
                    Flow tree
                </h3>
                <p className="font-normal text-neutral-500 text-sm leading-snug">
                    Source → routers → recipients. Hover a node to trace its
                    path.
                </p>
            </div>
            <div className="overflow-x-auto">
                <div
                    className="relative"
                    style={{ width, height, minWidth: width }}
                >
                    <svg
                        aria-hidden={true}
                        className="pointer-events-none absolute inset-0"
                        height={height}
                        width={width}
                    >
                        <title>Policy flow edges</title>
                        <defs>
                            <marker
                                id="flow-tree-arrow"
                                markerHeight="6"
                                markerWidth="6"
                                orient="auto"
                                refX="8"
                                refY="5"
                                viewBox="0 0 10 10"
                            >
                                <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
                            </marker>
                        </defs>
                        {nodes.flatMap((node) =>
                            node.children.map((child) => {
                                const sx = nodeX(node.col) + NODE_WIDTH;
                                const sy = nodeY(node.row) + NODE_HEIGHT / 2;
                                const ex = nodeX(child.col);
                                const ey = nodeY(child.row) + NODE_HEIGHT / 2;
                                const mx = (sx + ex) / 2;
                                const d = `M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`;
                                return (
                                    <path
                                        d={d}
                                        fill="none"
                                        key={`${node.id}->${child.id}`}
                                        markerEnd="url(#flow-tree-arrow)"
                                        stroke="#cbd5e1"
                                        strokeWidth={1.5}
                                    />
                                );
                            }),
                        )}
                    </svg>

                    {nodes.flatMap((node) =>
                        node.children
                            .filter((c) => c.edgeLabel != null)
                            .map((child) => {
                                const sx = nodeX(node.col) + NODE_WIDTH;
                                const ex = nodeX(child.col);
                                const sy = nodeY(node.row) + NODE_HEIGHT / 2;
                                const ey = nodeY(child.row) + NODE_HEIGHT / 2;
                                const mx = (sx + ex) / 2;
                                const my = (sy + ey) / 2;
                                return (
                                    <span
                                        className="absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-neutral-200 bg-neutral-0 px-1.5 py-0.5 font-semibold text-[10px] text-neutral-700 uppercase leading-tight tracking-wide"
                                        key={`lbl-${node.id}-${child.id}`}
                                        style={{ left: mx, top: my }}
                                    >
                                        {child.edgeLabel}
                                    </span>
                                );
                            }),
                    )}

                    {nodes.map((node) => (
                        <div
                            className={classNames(
                                'absolute flex flex-col justify-center gap-0.5 overflow-hidden rounded-lg border px-3 py-2 shadow-neutral-sm',
                                nodeTypeClass[node.type],
                            )}
                            key={node.id}
                            style={{
                                left: nodeX(node.col),
                                top: nodeY(node.row),
                                width: NODE_WIDTH,
                                height: NODE_HEIGHT,
                            }}
                            title={
                                node.parentId != null
                                    ? `${byId.get(node.parentId)?.title ?? 'parent'} → ${node.title}`
                                    : node.title
                            }
                        >
                            <span
                                className={classNames(
                                    'font-semibold text-[10px] uppercase leading-tight tracking-wide',
                                    nodeTypeTagClass[node.type],
                                )}
                            >
                                {nodeTypeLabel[node.type]}
                            </span>
                            <span className="truncate font-semibold text-neutral-800 text-sm leading-tight">
                                {node.title}
                            </span>
                            {node.subtitle != null && (
                                <span className="truncate font-normal text-neutral-500 text-xs leading-tight">
                                    {node.subtitle}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Hub-and-spoke layout for the flow canvas. The model is fixed by intent (not
 * inferred from edges): the ONE vault is the hub on the left, the strategy legs
 * stack in execution order in the middle, and a genuine external recipient (if
 * any) sits on the right. The vault and recipient are centred vertically against
 * the legs' stack so every spoke reads as drawing-from / returning-to the hub.
 *
 * NO HARDCODE: columns come from node `kind` (`source` → `strategy` →
 * `recipient`) and legs order by their strategy `index`, so any flow lays out
 * the same way regardless of token symbols or leg count. Geometry (x/y/w/h) is
 * computed from node sizes; the canvas auto-fits the resulting stage.
 */

import type { IFlowGraphNode } from './flowGraphTypes';

const COL_GAP = 220;
const ROW_GAP = 80;
const PAD = 48;
/** Short gap between a leg and a recipient hung beside it (the "satellite"). */
const ATTACH_GAP = 196;

export interface ILayoutResult {
    nodes: IFlowGraphNode[];
    width: number;
    height: number;
}

/** Column band a node lives in: vault hub, legs, external recipient. */
const columnFor = (node: IFlowGraphNode): number => {
    if (node.kind === 'source') {
        return 0;
    }
    if (node.kind === 'recipient') {
        return 2;
    }
    return 1;
};

export const layoutFlowGraph = (
    nodes: IFlowGraphNode[],
    // Edges don't drive the hub layout, but the signature stays stable for
    // callers (and a future topology-aware variant).
    _edges: unknown,
): ILayoutResult => {
    if (nodes.length === 0) {
        return { nodes, width: 0, height: 0 };
    }

    // Recipients pinned to a single producing leg are laid out as satellites
    // beside that leg, not in the recipient column.
    const attached = nodes.filter(
        (n) => n.kind === 'recipient' && n.attachedTo != null,
    );
    const columnNodes = nodes.filter((n) => !attached.includes(n));

    // Group into the fixed bands, dropping empty ones so the stage is tight
    // (e.g. no free recipient → vault sits directly beside the legs).
    const banded = new Map<number, IFlowGraphNode[]>();
    for (const node of columnNodes) {
        const c = columnFor(node);
        const list = banded.get(c);
        if (list) {
            list.push(node);
        } else {
            banded.set(c, [node]);
        }
    }
    const cols = [...banded.keys()].sort((a, b) => a - b);
    const columns = cols.map((c) => banded.get(c) ?? []);

    // Within a column: legs ordered by index (top→bottom); others stable.
    for (const column of columns) {
        column.sort((a, b) => {
            if (a.kind === 'strategy' && b.kind === 'strategy') {
                return (a.index ?? 0) - (b.index ?? 0);
            }
            return 0;
        });
    }

    const colWidth = columns.map((column) =>
        column.reduce((max, n) => Math.max(max, n.w), 0),
    );
    const colHeight = columns.map((column) =>
        column.length === 0
            ? 0
            : column.reduce((sum, n) => sum + n.h, 0) +
              (column.length - 1) * ROW_GAP,
    );
    const stackHeight = Math.max(0, ...colHeight);

    // x per column (left edge), accumulating widths + gaps.
    const colX: number[] = [];
    let x = PAD;
    for (let i = 0; i < columns.length; i += 1) {
        colX.push(x);
        x += (colWidth[i] ?? 0) + COL_GAP;
    }

    const placed = new Map<string, { x: number; y: number }>();
    columns.forEach((column, i) => {
        const colTop = PAD + (stackHeight - (colHeight[i] ?? 0)) / 2;
        const width = colWidth[i] ?? 0;
        let y = colTop;
        for (const node of column) {
            // Centre each node horizontally within its column band.
            const nodeX = (colX[i] ?? PAD) + (width - node.w) / 2;
            placed.set(node.id, { x: nodeX, y });
            y += node.h + ROW_GAP;
        }
    });

    // Place each attached recipient just to the right of its producing leg,
    // top-aligned — the short `distributes` edge reads as the connector.
    const byId = new Map(columnNodes.map((n) => [n.id, n]));
    for (const recipient of attached) {
        const leg = recipient.attachedTo
            ? byId.get(recipient.attachedTo)
            : undefined;
        const legPos = leg ? placed.get(leg.id) : undefined;
        if (leg && legPos) {
            placed.set(recipient.id, {
                x: legPos.x + leg.w + ATTACH_GAP,
                y: legPos.y,
            });
        }
    }

    const laidOut = nodes.map((node) => {
        const pos = placed.get(node.id);
        return pos ? { ...node, x: pos.x, y: pos.y } : node;
    });

    // Bounds cover every placed node (attached satellites can extend past the
    // last column / below a short column).
    let maxRight = 0;
    let maxBottom = 0;
    for (const node of laidOut) {
        const pos = placed.get(node.id);
        if (!pos) {
            continue;
        }
        maxRight = Math.max(maxRight, pos.x + node.w);
        maxBottom = Math.max(maxBottom, pos.y + node.h);
    }
    const width = maxRight + PAD;
    const height = Math.max(stackHeight + PAD * 2, maxBottom + PAD);

    return { nodes: laidOut, width, height };
};

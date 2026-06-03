import { buildFlowGraph } from './buildFlowGraph';
import type { IFlowDynamics, IFlowMachineDescriptor } from './flowGraphTypes';

/**
 * Reference machine: wrap, add-liquidity, gated-buyback, mirroring the Lido
 * Money Machine. Built from a generic descriptor + dynamics — nothing here is
 * LMM-specific in the builder. The legs are hub-and-spoke around the ONE vault:
 * each draws from it and returns proceeds to it, so the test proves real
 * per-leg vault-out/vault-in edges (no fabricated leg→leg pipeline) and a
 * net-to-vault that includes the value a leg retains.
 */
const descriptor: IFlowMachineDescriptor = {
    id: 'orch-1',
    source: { label: 'LMM DAO Vault', address: '0xdao' },
    recipient: { address: '0xagent', label: 'Lido Agent' },
    steps: [
        {
            index: 0,
            address: '0xwrap',
            kind: 'wrap',
            label: 'Wrap',
            paused: false,
            inputs: [{ role: 'budget', kind: 'full', label: 'Full Budget' }],
        },
        {
            index: 1,
            address: '0xuniv2',
            kind: 'univ2Liquidity',
            label: 'Add Liquidity',
            paused: false,
            inputs: [
                { role: 'budget', kind: 'full', label: 'Full Budget' },
                {
                    role: 'budget',
                    kind: 'streamUntil',
                    label: 'Stream-Until Budget',
                },
            ],
        },
        {
            index: 2,
            address: '0xcow',
            kind: 'gatedCowSwap',
            label: 'Buyback',
            paused: false,
            inputs: [
                {
                    role: 'budget',
                    kind: 'streamUntil',
                    label: 'Stream-Until Budget',
                },
                { role: 'gate', kind: 'priceFloor', label: 'Price-Floor Gate' },
                { role: 'epoch', kind: 'epoch', label: 'Epoch Provider' },
            ],
        },
    ],
};

const dynamics: IFlowDynamics = {
    balances: [
        { token: 'stETH', amount: 100 },
        { token: 'wstETH', amount: 12.4 },
        { token: 'LDO', amount: 36.4 },
    ],
    steps: [
        {
            address: '0xwrap',
            index: 0,
            state: 'accumulating',
            ins: [{ token: 'stETH', amount: 100, fidelity: 'real' }],
            outs: [{ token: 'wstETH', amount: 85.6, fidelity: 'estimated' }],
        },
        {
            address: '0xuniv2',
            index: 1,
            state: 'firing',
            ins: [
                { token: 'LDO', amount: 36.4, fidelity: 'real' },
                {
                    token: 'wstETH',
                    amount: 0.58,
                    fidelity: 'estimated',
                    perEpoch: true,
                },
            ],
            outs: [{ token: 'LP', amount: null, fidelity: 'opaque' }],
        },
        {
            address: '0xcow',
            index: 2,
            state: 'blocked',
            blocked: true,
            skipReason: 'gate closed',
            ins: [
                {
                    token: 'wstETH',
                    amount: 0.58,
                    fidelity: 'estimated',
                    perEpoch: true,
                },
            ],
            outs: [{ token: 'LDO', amount: null, fidelity: 'opaque' }],
        },
    ],
};

describe('buildFlowGraph', () => {
    it('builds real per-leg vault-out/vault-in edges (no inferred pipeline)', () => {
        const graph = buildFlowGraph({ descriptor, dynamics });

        // 4 feeds (vault→leg draws) + 3 returns (leg→vault proceeds).
        const feeds = graph.edges.filter((e) => e.kind === 'feeds');
        const returns = graph.edges.filter((e) => e.kind === 'returns');
        expect(feeds).toHaveLength(4);
        expect(returns).toHaveLength(3);
        // Nothing is inferred between legs, and nothing distributes externally
        // (all proceeds loop back to the one vault).
        expect(graph.edges.every((e) => e.kind !== 'distributes')).toBe(true);

        // Every feed leaves the vault; every return lands back in it.
        expect(feeds.every((e) => e.source === 'source')).toBe(true);
        expect(returns.every((e) => e.target === 'source')).toBe(true);

        // The liquidity leg draws BOTH its tokens straight from the vault — its
        // wstETH is no longer a fabricated pipeline edge from wrap.
        const univ2Feeds = feeds.filter((e) => e.target === '0xuniv2');
        expect(univ2Feeds.map((e) => e.token).sort()).toEqual([
            'LDO',
            'wstETH',
        ]);
        // The streamed slice keeps its /epoch badge.
        expect(univ2Feeds.find((e) => e.token === 'wstETH')?.perEpoch).toBe(
            true,
        );
    });

    it('surfaces net-to-vault including the retained wrap output', () => {
        const graph = buildFlowGraph({ descriptor, dynamics });
        const net = graph.nodes.find((n) => n.id === 'source')?.net;
        const wstETH = net?.find((e) => e.token === 'wstETH');

        // wrap returns 85.6 wstETH; univ2 + cow each draw a 0.58 slice back out →
        // ~84.44 net retained in the vault (the value the old model hid).
        expect(wstETH?.delta).toBeCloseTo(85.6 - 0.58 - 0.58, 5);
        // stETH only ever leaves.
        expect(net?.find((e) => e.token === 'stETH')?.delta).toBe(-100);
    });

    it('marks the blocked buyback output and flowing legs correctly', () => {
        const graph = buildFlowGraph({ descriptor, dynamics });
        const cowOut = graph.edges.find((e) => e.id === 'out-0xcow-LDO-0');
        const univ2Out = graph.edges.find((e) => e.id === 'out-0xuniv2-LP-0');

        expect(cowOut?.kind).toBe('returns');
        expect(cowOut?.blocked).toBe(true);
        expect(cowOut?.flowing).toBe(false);
        expect(univ2Out?.flowing).toBe(true);
        expect(univ2Out?.fidelity).toBe('opaque');
    });

    it('lays out the single vault hub left of the legs, no duplicate treasury', () => {
        const graph = buildFlowGraph({ descriptor, dynamics });
        const x = (id: string) => graph.nodes.find((n) => n.id === id)?.x ?? 0;

        // One vault node, legs stacked in one column to its right.
        expect(graph.nodes.filter((n) => n.kind === 'source')).toHaveLength(1);
        expect(graph.nodes.some((n) => n.kind === 'recipient')).toBe(false);
        expect(x('source')).toBeLessThan(x('0xwrap'));
        expect(x('0xwrap')).toBe(x('0xuniv2'));
        expect(x('0xuniv2')).toBe(x('0xcow'));
        expect(graph.width).toBeGreaterThan(0);
        expect(graph.height).toBeGreaterThan(0);
    });

    it('renders a genuine external recipient when a leg transfers out', () => {
        const externalDynamics: IFlowDynamics = {
            steps: [
                {
                    address: '0xwrap',
                    index: 0,
                    state: 'done',
                    ins: [{ token: 'stETH', amount: 100, fidelity: 'real' }],
                    outs: [
                        {
                            token: 'ETH',
                            amount: 5,
                            fidelity: 'real',
                            external: true,
                            to: '0xagent',
                        },
                    ],
                },
            ],
        };
        const graph = buildFlowGraph({
            descriptor,
            dynamics: externalDynamics,
        });
        const dist = graph.edges.find((e) => e.kind === 'distributes');
        expect(dist?.target).toBe('recipient-0xagent');
        const recipientNode = graph.nodes.find(
            (n) => n.id === 'recipient-0xagent',
        );
        expect(recipientNode).toBeDefined();
        // Fed by exactly one leg → hung beside it as a satellite.
        expect(recipientNode?.attachedTo).toBe('0xwrap');
        // An external transfer leaves the DAO → it must NOT count toward net.
        const net = graph.nodes.find((n) => n.id === 'source')?.net;
        expect(net?.some((e) => e.token === 'ETH')).toBe(false);
    });

    it('falls back to vault→leg feeds with no dynamics', () => {
        const graph = buildFlowGraph({ descriptor });
        // One opaque feed per leg, no returns (outputs unknown).
        expect(graph.edges).toHaveLength(3);
        expect(graph.edges.every((e) => e.kind === 'feeds')).toBe(true);
        expect(graph.edges.every((e) => e.fidelity === 'opaque')).toBe(true);
    });
});

import { buildFlowGraph } from './buildFlowGraph';
import type {
    IFlowDynamics,
    IFlowIndexedStep,
    IFlowMachineDescriptor,
} from './flowGraphTypes';
import { mergeLiveOverlay, toIndexedDynamics } from './toIndexedDynamics';

/**
 * Indexed steps mirror the live Hasura `FlowStep`/`FlowEdge` payload for the
 * Lido Money Machine: WRAP (stETH→wstETH), UNIV2 (wstETH→LP, opaque pending),
 * GATED_COWSWAP (wstETH→LDO, settled). Nothing here is hard-coded in the
 * producer — every value comes from an edge.
 */
const indexedSteps: IFlowIndexedStep[] = [
    {
        address: '0xwrap',
        index: 0,
        kind: 'wrap',
        status: 'executed',
        pending: false,
        edges: [
            {
                role: 'vaultOut',
                token: 'stETH',
                to: '0xwsteth',
                amount: 100,
                fidelity: 'real',
                pending: false,
            },
            {
                role: 'vaultIn',
                token: 'wstETH',
                to: '0xdao',
                amount: 80.9,
                fidelity: 'real',
                pending: false,
            },
        ],
    },
    {
        address: '0xuniv2',
        index: 1,
        kind: 'univ2Liquidity',
        status: 'executed',
        pending: true,
        edges: [
            {
                role: 'vaultOut',
                token: 'wstETH',
                to: '0xpair',
                amount: 40,
                fidelity: 'real',
                pending: false,
            },
            {
                role: 'vaultIn',
                token: 'UNI-V2',
                to: '0xdao',
                amount: null,
                fidelity: 'opaque',
                pending: true,
            },
        ],
    },
    {
        address: '0xcow',
        index: 2,
        kind: 'gatedCowSwap',
        status: 'executed',
        pending: false,
        edges: [
            {
                role: 'vaultOut',
                token: 'wstETH',
                to: '0xrelayer',
                amount: 0.48,
                fidelity: 'real',
                pending: false,
            },
            {
                role: 'vaultIn',
                token: 'LDO',
                to: '0xdao',
                amount: 100,
                fidelity: 'real',
                pending: false,
            },
        ],
    },
];

describe('toIndexedDynamics', () => {
    it('projects each step onto ins (vault-out) + outs (vault-in) with real amounts', () => {
        const dynamics = toIndexedDynamics({
            steps: indexedSteps,
            runId: 'run-1',
        });

        expect(dynamics.runId).toBe('run-1');
        const wrap = dynamics.steps.find((s) => s.address === '0xwrap');
        expect(wrap?.state).toBe('done');
        expect(wrap?.ins).toEqual([
            {
                token: 'stETH',
                amount: 100,
                fidelity: 'real',
                perEpoch: undefined,
            },
        ]);
        expect(wrap?.outs).toEqual([
            {
                token: 'wstETH',
                amount: 80.9,
                fidelity: 'real',
                perEpoch: undefined,
            },
        ]);
    });

    it('routes outputs landing outside the DAO to an external recipient', () => {
        // LP minted to the Lido Agent (0x3e40), not the operational DAO (0xdao):
        // the indexer tags it vaultIn, but with the DAO address known it is
        // shown as external (matches the live simulation + the contract).
        const steps: IFlowIndexedStep[] = [
            {
                address: '0xuniv2',
                index: 0,
                kind: 'univ2Liquidity',
                status: 'executed',
                pending: false,
                edges: [
                    {
                        role: 'vaultOut',
                        token: 'wstETH',
                        to: '0xpair',
                        amount: 1,
                        fidelity: 'real',
                        pending: false,
                    },
                    {
                        role: 'vaultIn',
                        token: 'UNI-V2',
                        to: '0x3e40',
                        amount: 6.32,
                        fidelity: 'real',
                        pending: false,
                    },
                ],
            },
        ];
        const dyn = toIndexedDynamics({ steps, daoAddress: '0xdao' });
        const lp = dyn.steps[0]?.outs?.[0];
        expect(lp?.external).toBe(true);
        expect(lp?.to).toBe('0x3e40');

        // Same edge with the matching DAO address loops back to the vault.
        const loop = toIndexedDynamics({ steps, daoAddress: '0x3e40' });
        expect(loop.steps[0]?.outs?.[0]?.external).toBeUndefined();
    });

    it('keeps opaque amounts as null (never fabricated)', () => {
        const dynamics = toIndexedDynamics({ steps: indexedSteps });
        const univ2 = dynamics.steps.find((s) => s.address === '0xuniv2');
        expect(univ2?.outs).toEqual([
            {
                token: 'UNI-V2',
                amount: null,
                fidelity: 'opaque',
                perEpoch: undefined,
            },
        ]);
    });

    it('feeds buildFlowGraph so it draws real vault-out/vault-in edges', () => {
        const descriptor: IFlowMachineDescriptor = {
            id: 'orch-1',
            source: { label: 'Vault', address: '0xdao' },
            recipient: { address: '0xagent', label: 'Agent' },
            steps: indexedSteps.map((s) => ({
                index: s.index,
                address: s.address,
                kind: s.kind,
                label: s.kind,
                paused: false,
                inputs: [],
            })),
        };
        const graph = buildFlowGraph({
            descriptor,
            dynamics: toIndexedDynamics({ steps: indexedSteps }),
        });

        // Each leg draws wstETH straight from the vault, and no edge runs
        // between two legs — only vault↔leg edges exist.
        expect(
            graph.edges.every(
                (e) => e.source === 'source' || e.target === 'source',
            ),
        ).toBe(true);
        const cowFeed = graph.edges.find(
            (e) => e.kind === 'feeds' && e.target === '0xcow',
        );
        expect(cowFeed?.source).toBe('source');
        expect(cowFeed?.token).toBe('wstETH');
        // CoW's LDO buyback loops back to the vault.
        const cowReturn = graph.edges.find(
            (e) => e.kind === 'returns' && e.source === '0xcow',
        );
        expect(cowReturn?.target).toBe('source');
        expect(cowReturn?.token).toBe('LDO');
    });
});

describe('mergeLiveOverlay', () => {
    const indexed = toIndexedDynamics({ steps: indexedSteps });

    it('returns indexed untouched when there is no live overlay', () => {
        expect(mergeLiveOverlay(indexed, null)).toBe(indexed);
    });

    it('keeps indexed amounts but takes live state/readings/balances', () => {
        const live: IFlowDynamics = {
            balances: [{ token: 'stETH', amount: 250 }],
            steps: [
                {
                    address: '0xcow',
                    index: 2,
                    state: 'blocked',
                    blocked: true,
                    badge: 'gate closed',
                    skipReason: 'gate closed',
                    inputReadings: [
                        { status: 'closed', detail: 'below floor' },
                    ],
                },
            ],
        };
        const merged = mergeLiveOverlay(indexed, live);

        const cow = merged.steps.find((s) => s.address === '0xcow');
        // Live readiness wins…
        expect(cow?.state).toBe('blocked');
        expect(cow?.blocked).toBe(true);
        expect(cow?.inputReadings).toEqual([
            { status: 'closed', detail: 'below floor' },
        ]);
        // …but the settled amount is preserved.
        expect(cow?.outs).toEqual([
            {
                token: 'LDO',
                amount: 100,
                fidelity: 'real',
                perEpoch: undefined,
            },
        ]);
        expect(merged.balances).toEqual([{ token: 'stETH', amount: 250 }]);
        expect(merged.runId).toBeNull();
    });
});

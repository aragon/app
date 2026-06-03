import type {
    IFlowDynamics,
    IFlowMachineDescriptor,
} from '../../canvas/flowGraphTypes';
import type {
    IFlowDaoData,
    IFlowOrchestrator,
    IFlowOrchestratorRun,
} from '../../types';
import {
    buildFlowOptions,
    buildHistory,
    buildNextRun,
    buildRecipientHint,
    buildStats,
    toRunDynamics,
} from './buildWorkbenchModel';

const run = (
    id: string,
    legs: IFlowOrchestratorRun['legs'],
    at = '2026-06-01T00:00:00.000Z',
): IFlowOrchestratorRun => ({ id, at, txHash: `0x${id}abcdef`, legs });

const orchestrator = (
    over: Partial<IFlowOrchestrator> = {},
): IFlowOrchestrator => ({
    id: 'orch-1',
    address: '0xDISPATCHER',
    name: 'Lido Money Machine',
    description: '',
    strategy: 'Multi-dispatch',
    status: 'live',
    statusLabel: 'Live',
    createdAt: '2026-05-01T00:00:00.000Z',
    installTxHash: '0xinstall',
    chain: [],
    runs: [],
    totalRuns: 0,
    ...over,
});

const NOW = Date.parse('2026-06-02T00:00:00.000Z');

describe('buildWorkbenchModel', () => {
    describe('buildFlowOptions', () => {
        it('maps each orchestrator to an option, marking run ones live', () => {
            const data = {
                orchestrators: [
                    orchestrator({
                        id: 'a',
                        name: 'A',
                        totalRuns: 3,
                        embeddedStrategies: [
                            { index: 0 },
                            { index: 1 },
                        ] as IFlowOrchestrator['embeddedStrategies'],
                    }),
                    orchestrator({
                        id: 'b',
                        name: 'B',
                        totalRuns: 0,
                        chain: [null, null, null],
                    }),
                ],
            } as IFlowDaoData;

            const options = buildFlowOptions(data);
            expect(options).toEqual([
                {
                    id: 'a',
                    name: 'A',
                    type: 'Multi-dispatch',
                    strategies: 2,
                    status: 'live',
                },
                {
                    id: 'b',
                    name: 'B',
                    type: 'Multi-dispatch',
                    strategies: 3,
                    status: 'never run',
                },
            ]);
        });
    });

    describe('buildRecipientHint', () => {
        it('picks the most-dispatched non-DAO recipient', () => {
            const data = {
                recipients: [
                    {
                        address: '0xdao',
                        name: 'DAO',
                        role: 'dao',
                        dispatchCount: 99,
                    },
                    {
                        address: '0xagent',
                        name: 'Agent',
                        role: 'linkedaccount',
                        dispatchCount: 12,
                    },
                    {
                        address: '0xother',
                        name: 'Other',
                        dispatchCount: 3,
                    },
                ],
            } as unknown as IFlowDaoData;

            expect(buildRecipientHint(data)).toEqual({
                label: 'Agent',
                address: '0xagent',
            });
        });

        it('returns undefined when there are no non-DAO recipients', () => {
            const data = {
                recipients: [
                    {
                        address: '0xdao',
                        name: 'DAO',
                        role: 'dao',
                        dispatchCount: 1,
                    },
                ],
            } as unknown as IFlowDaoData;
            expect(buildRecipientHint(data)).toBeUndefined();
        });
    });

    describe('buildStats', () => {
        it('aggregates token-only moved/buyback totals and success rate', () => {
            const o = orchestrator({
                totalRuns: 3,
                runs: [
                    run('1', [
                        {
                            policyId: 'p',
                            policyName: 'Wrap',
                            strategy: 'Stream',
                            amountOut: 100,
                            tokenOut: 'stETH',
                            recipientsCount: 1,
                            status: 'ok',
                        },
                        {
                            policyId: 'p2',
                            policyName: 'Buyback',
                            strategy: 'CoW swap',
                            amountOut: 600,
                            tokenOut: 'LDO',
                            recipientsCount: 1,
                            status: 'ok',
                        },
                    ]),
                    run('2', [
                        {
                            policyId: 'p2',
                            policyName: 'Buyback',
                            strategy: 'CoW swap',
                            amountOut: 400,
                            tokenOut: 'LDO',
                            recipientsCount: 1,
                            status: 'skipped',
                        },
                    ]),
                ],
            });

            const stats = buildStats(o, NOW);
            expect(stats.dispatches).toBe(3);
            // run 1 ok, run 2 has a skipped leg → partial.
            expect(stats.successRate).toBeCloseTo(0.5);
            expect(stats.totalMoved).toEqual([
                { token: 'stETH', amount: 100 },
                { token: 'LDO', amount: 600 },
            ]);
            // Skipped leg excluded; only the ok CoW leg counts as a buyback.
            expect(stats.buybacks).toEqual([{ token: 'LDO', amount: 600 }]);
            expect(stats.activeSinceDays).toBeGreaterThanOrEqual(30);
        });
    });

    describe('buildHistory', () => {
        it('labels runs by descending number and derives status from legs', () => {
            const o = orchestrator({
                totalRuns: 2,
                runs: [
                    run('newest', [
                        {
                            policyId: 'p',
                            policyName: 'Wrap',
                            strategy: 'Stream',
                            amountOut: 1,
                            tokenOut: 'wstETH',
                            recipientsCount: 1,
                            status: 'failed',
                        },
                    ]),
                    run('older', [
                        {
                            policyId: 'p',
                            policyName: 'Wrap',
                            strategy: 'Stream',
                            amountOut: 2,
                            tokenOut: 'wstETH',
                            recipientsCount: 1,
                            status: 'ok',
                        },
                    ]),
                ],
            });
            const history = buildHistory(o, NOW);
            expect(history.map((h) => h.label)).toEqual(['#2', '#1']);
            expect(history[0].status).toBe('failed');
            expect(history[1].status).toBe('ok');
            expect(history[0].legs?.[0]).toMatchObject({
                kind: 'Stream',
                failed: true,
            });
        });
    });

    describe('toRunDynamics', () => {
        const descriptor: IFlowMachineDescriptor = {
            id: 'orch-1',
            source: { label: 'Vault' },
            steps: [
                {
                    index: 0,
                    address: '0xwrap',
                    kind: 'wrap',
                    label: 'Wrap',
                    paused: false,
                    inputs: [],
                },
                {
                    index: 1,
                    address: '0xcow',
                    kind: 'gatedCowSwap',
                    label: 'Buyback',
                    paused: false,
                    inputs: [],
                },
            ],
        };

        it('projects leg statuses + amounts onto step dynamics by order', () => {
            const r = run('r1', [
                {
                    policyId: 'p',
                    policyName: 'Wrap',
                    strategy: 'Stream',
                    amountIn: 100,
                    tokenIn: 'stETH',
                    amountOut: 85,
                    tokenOut: 'wstETH',
                    recipientsCount: 1,
                    status: 'ok',
                },
                {
                    policyId: 'p2',
                    policyName: 'Buyback',
                    strategy: 'CoW swap',
                    amountOut: 600,
                    tokenOut: 'LDO',
                    recipientsCount: 1,
                    status: 'skipped',
                },
            ]);
            const dyn = toRunDynamics(descriptor, r);
            expect(dyn.runId).toBe('r1');
            expect(dyn.steps[0]).toMatchObject({
                address: '0xwrap',
                state: 'done',
                outs: [{ token: 'wstETH', amount: 85, fidelity: 'real' }],
                ins: [{ token: 'stETH', amount: 100, fidelity: 'real' }],
            });
            expect(dyn.steps[1]).toMatchObject({
                address: '0xcow',
                state: 'skipped',
            });
        });

        it('marks steps with no matching leg as idle', () => {
            const r = run('r2', []);
            const dyn = toRunDynamics(descriptor, r);
            expect(dyn.steps.every((s) => s.state === 'idle')).toBe(true);
        });
    });

    describe('buildNextRun', () => {
        it('summarizes fire/skip per step and resolves labels by address', () => {
            const descriptor: IFlowMachineDescriptor = {
                id: 'orch-1',
                source: { label: 'Vault' },
                steps: [
                    {
                        index: 0,
                        address: '0xwrap',
                        kind: 'wrap',
                        label: 'Wrap',
                        paused: false,
                        inputs: [],
                    },
                    {
                        index: 1,
                        address: '0xcow',
                        kind: 'gatedCowSwap',
                        label: 'Buyback',
                        paused: false,
                        inputs: [],
                    },
                ],
            };
            const dynamics: IFlowDynamics = {
                steps: [
                    {
                        address: '0xwrap',
                        index: 0,
                        state: 'firing',
                        ins: [
                            { token: 'stETH', amount: 100, fidelity: 'real' },
                        ],
                        outs: [
                            {
                                token: 'wstETH',
                                amount: 85,
                                fidelity: 'estimated',
                            },
                        ],
                        inputReadings: [{ epoch: 47_123 }],
                    },
                    {
                        address: '0xcow',
                        index: 1,
                        state: 'blocked',
                        skipReason: 'gate closed',
                        outs: undefined,
                    },
                ],
            };
            const next = buildNextRun(descriptor, dynamics);
            expect(next.epoch).toBe(47_123);
            expect(next.summary).toBe('Wrap · Buyback skipped');
            expect(next.steps[0]).toMatchObject({
                kind: 'Wrap',
                willFire: true,
            });
            expect(next.steps[1]).toMatchObject({
                kind: 'Buyback',
                willFire: false,
                skipReason: 'gate closed',
                outs: [{ token: '?', amount: null, fidelity: 'opaque' }],
            });
        });
    });
});

// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

// Live-status fetcher.  Given a fresh PublicClient + the inspected
// TopologyGraph, reads every "what does the DAO actually hold and what would
// the next dispatch do?" datum from chain.  Returns a typed snapshot the
// StatusView can render without re-walking the topology.

import { useCallback, useEffect, useRef, useState } from 'react';
import { type Address, type PublicClient, parseAbi, zeroAddress } from 'viem';
import {
    type BudgetNode,
    type FlowGraph,
    type StrategyNode,
    simulate,
    type TokenInfo,
    type TopologyGraph,
} from '@/shared/lidoPreview';

// Mainnet V2 factory (same address on forks).  Used to look up the LP pair
// that the UniV2 strategy adds liquidity into.
const UNIV2_FACTORY: Address = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

const erc20Abi = parseAbi([
    'function balanceOf(address) view returns (uint256)',
    'function allowance(address,address) view returns (uint256)',
    'function totalSupply() view returns (uint256)',
]);
const budgetAbi = parseAbi(['function budget() view returns (uint256)']);
const epochProviderAbi = parseAbi([
    'function getEpoch() view returns (uint256)',
]);
const gateAbi = parseAbi(['function passes() view returns (bool)']);
const oraclePriceAbi = parseAbi([
    'function getPrice(address,address) view returns (uint256,uint256)',
]);
const factoryAbi = parseAbi([
    'function getPair(address,address) view returns (address)',
]);
const mockSettlementAbi = parseAbi([
    'function ordersPlaced() view returns (uint256)',
]);

export type StatusSnapshot = {
    block: bigint;
    /** Anvil's block.timestamp at fetch time.  Authoritative for any
     *  on-chain "is this stale?" check — JS wallclock can drift arbitrarily
     *  far from anvil after Warp actions. */
    blockTimestamp: bigint;
    fetchedAt: number;
    dao: Address;
    /** DAO token holdings — every distinct token referenced by any budget. */
    balances: { token: TokenInfo; amount: bigint }[];
    /** Per-strategy `budget()` reading. */
    budgets: {
        strategyAddress: Address;
        strategyKind: StrategyNode['kind'];
        label: string;
        /** Reading came from this budget node. */
        budgetAddress: Address;
        budgetKind: BudgetNode['kind'];
        token: TokenInfo;
        amount: bigint;
    }[];
    /** PriceFloorGate (if any GatedCowSwap is in the topology). */
    gate?: {
        address: Address;
        passes: boolean;
        tokenA: Address;
        tokenB: Address;
        threshold: bigint;
        /** Latest oracle reading.  `null` if the oracle call reverted. */
        price: bigint | null;
        updatedAt: bigint | null;
        maxStaleness: bigint;
    };
    /** CowSwap orders + DAO's wstETH allowance to the (mock) settlement. */
    cowSwap?: {
        settlement: Address;
        ordersPlaced: bigint | null;
        allowance: bigint;
        allowanceToken: TokenInfo;
    };
    /** StreamUntil budget config + computed remaining. */
    stream?: {
        budgetAddress: Address;
        token: TokenInfo;
        targetEpoch: bigint;
        floorEpochs: number;
        currentEpoch: bigint;
        remaining: bigint;
    };
    /** UniV2 LP pair + recipient's LP balance.  `pair === null` means the
     *  pair hasn't been deployed yet (no factory entry). */
    lp?: {
        pair: Address | null;
        recipientBalance: bigint;
    };
    /** What `simulate()` predicts the next `dispatch()` will actually do.
     *  `null` when the simulator itself failed (e.g. a predictor reverted).
     *  Consumed by the Dispatch-confirmation modal — not surfaced as a card. */
    nextDispatch: FlowGraph | null;
    nextDispatchError?: string;
};

export type StatusState =
    | { kind: 'idle' }
    | { kind: 'loading' }
    // `refreshing` distinguishes a polled re-read (snapshot is "live") from
    // the first read after Inspect (snapshot didn't exist before).  The
    // StatusView keeps rendering the prior snapshot while a refresh is in
    // flight so the user doesn't see a flash to "Loading…".  `refreshError`
    // is set when an in-flight refresh fails but we already had data — we
    // keep the stale snapshot visible and surface the error inline.
    | {
          kind: 'ready';
          snapshot: StatusSnapshot;
          refreshing: boolean;
          refreshError?: string;
      }
    | { kind: 'error'; message: string };

/**
 * Resolves the StatusSnapshot for the current topology.  Re-runs whenever
 * `topology` changes; call `refresh()` to re-fetch against the current chain
 * head.
 */
export function useStatus(
    clientFactory: () => PublicClient,
    topology: TopologyGraph | null,
    /** Polling cadence in ms.  0 = no polling (refresh only on manual call). */
    pollMs = 5000,
): { state: StatusState; refresh: () => void } {
    const [state, setState] = useState<StatusState>({ kind: 'idle' });
    // Mirror `state` into a ref so the `fetch` callback (memoized on
    // [clientFactory, topology]) can read the *current* state at call time
    // without invalidating itself on every state transition.
    const stateRef = useRef<StatusState>({ kind: 'idle' });
    stateRef.current = state;

    const fetch = useCallback(async () => {
        if (!topology || topology.root.kind !== 'plugin.dispatch') {
            setState({ kind: 'idle' });
            return;
        }
        // If we already have a snapshot, do a quiet refresh: keep the prior
        // snapshot rendered, only flip the `refreshing` flag.
        const prior = stateRef.current;
        if (prior.kind === 'ready') {
            setState({ ...prior, refreshing: true, refreshError: undefined });
        } else {
            setState({ kind: 'loading' });
        }
        try {
            const client = clientFactory();
            // Snapshot reads + simulate() in parallel.  simulate() can throw (a
            // predictor revert) — surface it as a `nextDispatchError` rather than
            // aborting the whole snapshot, since the live balances/budgets/gate
            // are still useful even when the next-dispatch preview fails.
            const [snap, simResult] = await Promise.all([
                fetchSnapshot(client, topology),
                simulate(client, topology).then(
                    (flow) => ({ ok: true as const, flow }),
                    (err: unknown) => ({
                        ok: false as const,
                        error: err instanceof Error ? err.message : String(err),
                    }),
                ),
            ]);
            const final: StatusSnapshot = simResult.ok
                ? { ...snap, nextDispatch: simResult.flow }
                : {
                      ...snap,
                      nextDispatch: null,
                      nextDispatchError: simResult.error,
                  };
            setState({ kind: 'ready', snapshot: final, refreshing: false });
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            // Don't blow away a known-good snapshot on a transient refresh
            // failure — keep showing the prior values and surface the error as a
            // banner.  Only fall back to the hard-error state if we have nothing.
            if (prior.kind === 'ready') {
                setState({
                    kind: 'ready',
                    snapshot: prior.snapshot,
                    refreshing: false,
                    refreshError: message,
                });
            } else {
                setState({ kind: 'error', message });
            }
        }
    }, [clientFactory, topology]);

    useEffect(() => {
        void fetch();
    }, [fetch]);

    // Periodic refresh.  Pauses while the tab is hidden so we don't burn RPC
    // when the user is away.
    useEffect(() => {
        if (pollMs <= 0 || !topology) {
            return;
        }
        let cancelled = false;
        const tick = () => {
            if (!cancelled && !document.hidden) {
                void fetch();
            }
        };
        const handle = window.setInterval(tick, pollMs);
        const onVis = () => {
            // Snap to a fresh read the moment we come back.
            if (!document.hidden) {
                tick();
            }
        };
        document.addEventListener('visibilitychange', onVis);
        return () => {
            cancelled = true;
            window.clearInterval(handle);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, [fetch, pollMs, topology]);

    return { state, refresh: () => void fetch() };
}

// ---------------------------------------------------------------------------

async function fetchSnapshot(
    client: PublicClient,
    topology: TopologyGraph,
): Promise<StatusSnapshot> {
    if (topology.root.kind !== 'plugin.dispatch') {
        throw new Error('StatusView only supports DispatcherPlugin topologies');
    }
    const dao = topology.root.dao;
    const strategies = topology.root.strategies;

    // --- 1. Collect addresses + tokens from the topology ---------------------

    const tokens = new Map<string, TokenInfo>();
    const budgetReads: {
        node: BudgetNode;
        label: string;
        strategy: StrategyNode;
    }[] = [];
    let gateNode:
        | Extract<
              StrategyNode,
              { kind: 'strategy.dispatch.lido.gated-cowswap' }
          >['gate']
        | null = null;
    let cowSwapSettlement: Address | null = null;
    let cowSwapTargetToken: TokenInfo | null = null;
    let cowSwapSellToken: TokenInfo | null = null;
    let streamBudgetNode: Extract<
        BudgetNode,
        { kind: 'budget.lido.stream-until' }
    > | null = null;
    let univ2Strategy: Extract<
        StrategyNode,
        { kind: 'strategy.dispatch.lido.univ2-liquidity' }
    > | null = null;
    const trackBudget = (n: BudgetNode) => {
        tokens.set(n.token.address.toLowerCase(), n.token);
        if (n.kind === 'budget.lido.stream-until' && !streamBudgetNode) {
            streamBudgetNode = n;
        }
    };

    for (const s of strategies) {
        const label = strategyLabel(s);

        switch (s.kind) {
            case 'strategy.dispatch.lido.wrap':
                trackBudget(s.budget);
                budgetReads.push({ node: s.budget, label, strategy: s });
                break;
            case 'strategy.dispatch.lido.univ2-liquidity':
                trackBudget(s.budget);
                trackBudget(s.budgetB);
                budgetReads.push({
                    node: s.budget,
                    label: `${label} (LDO)`,
                    strategy: s,
                });
                budgetReads.push({
                    node: s.budgetB,
                    label: `${label} (stream)`,
                    strategy: s,
                });
                univ2Strategy = s;
                break;
            case 'strategy.dispatch.lido.gated-cowswap':
                trackBudget(s.budget);
                budgetReads.push({ node: s.budget, label, strategy: s });
                gateNode = s.gate;
                cowSwapSettlement = s.cowSwapSettlement;
                cowSwapTargetToken = s.targetToken;
                cowSwapSellToken = s.budget.token;
                tokens.set(s.targetToken.address.toLowerCase(), s.targetToken);
                break;
            default:
                if ('budget' in s && s.budget) {
                    trackBudget(s.budget);
                }
        }
    }

    const block = await client.getBlock();

    // --- 2. Issue all reads in parallel --------------------------------------

    const balancesPromise = Promise.all(
        [...tokens.values()].map(async (token) => ({
            token,
            amount: await client.readContract({
                address: token.address,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [dao],
            }),
        })),
    );

    const budgetsPromise = Promise.all(
        budgetReads.map(async ({ node, label, strategy }) => {
            const amount = await client
                .readContract({
                    address: node.address,
                    abi: budgetAbi,
                    functionName: 'budget',
                })
                .catch(() => 0n);
            return {
                strategyAddress: strategy.address,
                strategyKind: strategy.kind,
                label,
                budgetAddress: node.address,
                budgetKind: node.kind,
                token: node.token,
                amount,
            };
        }),
    );

    const gatePromise = gateNode
        ? (async () => {
              // Capture into a non-narrowable local so TS doesn't lose the type
              // through the async boundary.
              const g = gateNode!;
              const [passes, priceResult] = await Promise.all([
                  client.readContract({
                      address: g.address,
                      abi: gateAbi,
                      functionName: 'passes',
                  }),
                  client
                      .readContract({
                          address: g.oracle,
                          abi: oraclePriceAbi,
                          functionName: 'getPrice',
                          args: [g.tokenA, g.tokenB],
                      })
                      .catch(() => null),
              ]);
              return {
                  address: g.address,
                  passes,
                  tokenA: g.tokenA,
                  tokenB: g.tokenB,
                  threshold: g.threshold,
                  price: priceResult ? priceResult[0] : null,
                  updatedAt: priceResult ? priceResult[1] : null,
                  maxStaleness: g.maxStaleness,
              };
          })()
        : Promise.resolve(undefined);

    const cowSwapPromise =
        cowSwapSettlement && cowSwapSellToken
            ? (async () => {
                  const settlement = cowSwapSettlement!;
                  const sellToken = cowSwapSellToken!;
                  const [ordersPlaced, allowance] = await Promise.all([
                      client
                          .readContract({
                              address: settlement,
                              abi: mockSettlementAbi,
                              functionName: 'ordersPlaced',
                          })
                          .catch(() => null),
                      client.readContract({
                          address: sellToken.address,
                          abi: erc20Abi,
                          functionName: 'allowance',
                          args: [dao, settlement],
                      }),
                  ]);
                  return {
                      settlement,
                      ordersPlaced,
                      allowance,
                      allowanceToken: sellToken,
                  };
              })()
            : Promise.resolve(undefined);

    const streamPromise = streamBudgetNode
        ? (async () => {
              const sb = streamBudgetNode!;
              const currentEpoch = await client.readContract({
                  address: sb.epochProvider.address,
                  abi: epochProviderAbi,
                  functionName: 'getEpoch',
              });
              const remaining =
                  sb.targetEpoch > currentEpoch
                      ? sb.targetEpoch - currentEpoch
                      : 0n;
              return {
                  budgetAddress: sb.address,
                  token: sb.token,
                  targetEpoch: sb.targetEpoch,
                  floorEpochs: sb.floorEpochs,
                  currentEpoch,
                  remaining,
              };
          })()
        : Promise.resolve(undefined);

    const lpPromise =
        univ2Strategy && cowSwapTargetToken
            ? (async () => {
                  const u = univ2Strategy!;
                  const tokenA = u.budget.token.address;
                  const tokenB = u.budgetB.token.address;
                  const pair = await client.readContract({
                      address: UNIV2_FACTORY,
                      abi: factoryAbi,
                      functionName: 'getPair',
                      args: [tokenA, tokenB],
                  });
                  if (pair === zeroAddress) {
                      return { pair: null, recipientBalance: 0n };
                  }
                  const recipientBalance = await client.readContract({
                      address: pair,
                      abi: erc20Abi,
                      functionName: 'balanceOf',
                      args: [u.lpRecipient],
                  });
                  return { pair, recipientBalance };
              })()
            : Promise.resolve(undefined);

    // `Promise.all` with mixed-shape entries picks the wrong overload here
    // (Iterable<single-type>); awaiting each in sequence keeps the inferred
    // shapes intact and the runtime cost is negligible (the in-flight
    // promises were created above and are racing already).
    const balances = await balancesPromise;
    const budgets = await budgetsPromise;
    const gate = await gatePromise;
    const cowSwap = await cowSwapPromise;
    const stream = await streamPromise;
    const lp = await lpPromise;

    return {
        block: block.number,
        blockTimestamp: block.timestamp,
        fetchedAt: Date.now(),
        dao,
        balances,
        budgets,
        ...(gate ? { gate } : {}),
        ...(cowSwap ? { cowSwap } : {}),
        ...(stream ? { stream } : {}),
        ...(lp ? { lp } : {}),
        // `nextDispatch` is filled in by the caller (the hook), which races
        // simulate() against the snapshot fetch.
        nextDispatch: null,
    };
}

function strategyLabel(s: StrategyNode): string {
    switch (s.kind) {
        case 'strategy.dispatch.lido.wrap':
            return 'Wrap';
        case 'strategy.dispatch.lido.univ2-liquidity':
            return 'UniV2 LP';
        case 'strategy.dispatch.lido.gated-cowswap':
            return 'Gated CowSwap';
        case 'strategy.dispatch.transfer':
            return 'Transfer';
        case 'strategy.dispatch.burn':
            return 'Burn';
        case 'strategy.dispatch.epoch-transfer':
            return 'EpochTransfer';
        default:
            return 'Strategy';
    }
}

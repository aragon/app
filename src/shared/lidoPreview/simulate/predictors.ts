// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import { parseAbi, zeroAddress } from 'viem';
import { registerPredictor } from '../registry/index';
import type { PredictResult, SimulationContext } from '../registry/types';
import type { Transfer } from '../types/flow';
import type { StrategyNode } from '../types/topology';
import { splitAllocations } from './allocations';
import { readBudget } from './budget';
import { type ChainState, getEpoch } from './chainState';

// Predictors describe WHAT happens; the simulator owns WHERE the balances
// end up. Each one returns a PredictResult — transfers + external calls +
// status. The simulator applies them to its mutable ChainState between
// steps and builds `before` / `after` snapshots around the call.

// --- Transfer ---------------------------------------------------------------

registerPredictor({
    kind: 'strategy.dispatch.transfer',
    predict: async (node, state, ctx) => predictTransfer(node, state, ctx),
});

async function predictTransfer(
    node: StrategyNode,
    state: ChainState,
    ctx: SimulationContext,
): Promise<PredictResult> {
    if (node.kind !== 'strategy.dispatch.transfer') {
        throw new Error(`predictor kind mismatch: ${node.kind}`);
    }
    if (node.paused) {
        return skipPaused();
    }

    const budget = readBudget(node.budget, state);
    if (budget.wouldRevert) {
        return noOp(`budget would revert: ${budget.wouldRevert.reason}`, {
            amount: budget.amount,
            token: budget.token,
            provenance: budget.provenance,
        });
    }
    if (budget.amount === 0n) {
        return noOp('budget amount is zero', {
            amount: 0n,
            token: budget.token,
            provenance: budget.provenance,
        });
    }

    const { allocations, residual } = splitAllocations(
        node.splitter,
        budget.amount,
    );
    const transfers = buildTransfers(ctx.vault, node, allocations);

    const notes: string[] = [];
    if (residual > 0n) {
        notes.push(
            `residual of ${residual} remains in the vault (splitter rounding / incomplete ratios)`,
        );
    }

    return {
        status: 'executed',
        budget: {
            amount: budget.amount,
            token: budget.token,
            provenance: budget.provenance,
        },
        transfers,
        externalCalls: [],
        notes,
    };
}

// --- Burn -------------------------------------------------------------------

registerPredictor({
    kind: 'strategy.dispatch.burn',
    predict: async (node, state, _ctx) => {
        if (node.kind !== 'strategy.dispatch.burn') {
            throw new Error(`predictor kind mismatch: ${node.kind}`);
        }
        if (node.paused) {
            return skipPaused();
        }

        const budget = readBudget(node.budget, state);
        if (budget.wouldRevert) {
            return noOp(`budget would revert: ${budget.wouldRevert.reason}`, {
                amount: budget.amount,
                token: budget.token,
                provenance: budget.provenance,
            });
        }
        if (budget.amount === 0n) {
            return noOp('budget amount is zero', {
                amount: 0n,
                token: budget.token,
                provenance: budget.provenance,
            });
        }

        return {
            status: 'executed',
            budget: {
                amount: budget.amount,
                token: budget.token,
                provenance: budget.provenance,
            },
            transfers: [],
            externalCalls: [
                {
                    to: node.budget.token.address,
                    description: `burn(${budget.amount})`,
                    produces: [],
                    consumes: [
                        {
                            token: node.budget.token,
                            amount: budget.amount,
                            provenance: 'deterministic',
                        },
                    ],
                },
            ],
            notes: [],
        };
    },
});

// --- Epoch transfer ---------------------------------------------------------

registerPredictor({
    kind: 'strategy.dispatch.epoch-transfer',
    predict: async (node, state, ctx) => {
        if (node.kind !== 'strategy.dispatch.epoch-transfer') {
            throw new Error(`predictor kind mismatch: ${node.kind}`);
        }
        if (node.paused) {
            return skipPaused();
        }

        const currentEpoch = getEpoch(state, node.epochProvider.address);
        if (currentEpoch === undefined) {
            ctx.warn(
                'epoch-provider.missing',
                `epoch provider ${node.epochProvider.address} not in chain state`,
                ctx.stepIndex,
            );
            return noOp('epoch provider unreadable');
        }

        if (currentEpoch <= node.lastDispatchedEpoch) {
            return noOp(
                `already dispatched for epoch ${node.lastDispatchedEpoch} (current: ${currentEpoch})`,
            );
        }

        const budget = readBudget(node.budget, state);
        if (budget.wouldRevert) {
            return noOp(`budget would revert: ${budget.wouldRevert.reason}`, {
                amount: budget.amount,
                token: budget.token,
                provenance: budget.provenance,
            });
        }
        if (budget.amount === 0n) {
            return noOp('budget amount is zero', {
                amount: 0n,
                token: budget.token,
                provenance: budget.provenance,
            });
        }

        const { allocations, residual } = splitAllocations(
            node.splitter,
            budget.amount,
        );
        const transfers = buildTransfers(ctx.vault, node, allocations);

        const notes: string[] = [];
        const skipped = currentEpoch - node.lastDispatchedEpoch - 1n;
        if (skipped > 0n) {
            notes.push(
                `${skipped} epoch(s) skipped — catch-up behaviour depends on the budget kind`,
            );
        }
        if (residual > 0n) {
            notes.push(`residual of ${residual} remains in the vault`);
        }

        return {
            status: 'executed',
            budget: {
                amount: budget.amount,
                token: budget.token,
                provenance: budget.provenance,
            },
            transfers,
            externalCalls: [],
            notes,
        };
    },
});

// --- Lido: Wrap -------------------------------------------------------------

const wstETHViewAbi = parseAbi([
    // wstETH.getWstETHByStETH(stETHAmount) → shares to be minted on wrap.
    // (Lido's `getSharesByPooledEth` is on the stETH contract, not wstETH.)
    'function getWstETHByStETH(uint256) view returns (uint256)',
]);

registerPredictor({
    kind: 'strategy.dispatch.lido.wrap',
    predict: async (node, state, ctx) => {
        if (node.kind !== 'strategy.dispatch.lido.wrap') {
            throw new Error(`predictor kind mismatch: ${node.kind}`);
        }
        if (node.paused) {
            return skipPaused();
        }

        const budget = readBudget(node.budget, state);
        if (budget.wouldRevert) {
            return noOp(`budget would revert: ${budget.wouldRevert.reason}`, {
                amount: budget.amount,
                token: budget.token,
                provenance: budget.provenance,
            });
        }
        if (budget.amount === 0n) {
            return noOp('budget amount is zero', {
                amount: 0n,
                token: budget.token,
                provenance: budget.provenance,
            });
        }

        // wstETH.wrap(stETHAmount) mints `getWstETHByStETH(stETHAmount)` wstETH
        // back to the caller.  Reading at the current block is the closest we
        // can get to deterministic.
        const wstETHAmount = await ctx.client.readContract({
            address: node.wstETH,
            abi: wstETHViewAbi,
            functionName: 'getWstETHByStETH',
            args: [budget.amount],
        });

        return {
            status: 'executed',
            budget: {
                amount: budget.amount,
                token: budget.token,
                provenance: budget.provenance,
            },
            transfers: [],
            externalCalls: [
                {
                    to: node.wstETH,
                    description: `wrap(${budget.amount})`,
                    consumes: [
                        {
                            token: budget.token,
                            amount: budget.amount,
                            provenance: 'deterministic',
                        },
                    ],
                    produces: [
                        {
                            token: node.wstETHToken,
                            amount: wstETHAmount,
                            provenance: 'deterministic',
                        },
                    ],
                },
            ],
            notes: [],
        };
    },
});

// --- Lido: UniV2 add-liquidity ---------------------------------------------

const univ2FactoryAbi = parseAbi([
    'function getPair(address tokenA, address tokenB) view returns (address)',
]);
const univ2PairAbi = parseAbi([
    'function getReserves() view returns (uint112,uint112,uint32)',
    'function token0() view returns (address)',
    'function totalSupply() view returns (uint256)',
]);
const univ2RouterAbi = parseAbi(['function factory() view returns (address)']);
const oraclePriceAbi = parseAbi([
    'function getPrice(address,address) view returns (uint256,uint256)',
]);

const SLIPPAGE_BASE = 10_000n;
const PRICE_SCALE = 10n ** 18n;

registerPredictor({
    kind: 'strategy.dispatch.lido.univ2-liquidity',
    predict: async (node, state, ctx) => {
        if (node.kind !== 'strategy.dispatch.lido.univ2-liquidity') {
            throw new Error(`predictor kind mismatch: ${node.kind}`);
        }
        if (node.paused) {
            return skipPaused();
        }

        const currentEpoch = getEpoch(state, node.epochProvider.address);
        if (currentEpoch === undefined) {
            return noOp('epoch provider unreadable');
        }
        if (currentEpoch === node.lastEpoch) {
            return noOp('same epoch — slot already burned');
        }

        const budgetA = readBudget(node.budget, state);
        const budgetB = readBudget(node.budgetB, state);
        if (budgetA.wouldRevert) {
            return noOp(`budgetA would revert: ${budgetA.wouldRevert.reason}`);
        }
        if (budgetB.wouldRevert) {
            return noOp(`budgetB would revert: ${budgetB.wouldRevert.reason}`);
        }
        if (budgetA.amount === 0n) {
            return noOp(`${budgetA.token.symbol ?? 'side A'} budget is 0`);
        }
        if (budgetB.amount === 0n) {
            return noOp(`${budgetB.token.symbol ?? 'side B'} budget is 0`);
        }

        // Oracle price (LDO → wstETH).  If unreadable, surface opaque.
        let priceAB: bigint;
        let priceUpdatedAt: bigint;
        try {
            const [price, updatedAt] = await ctx.client.readContract({
                address: node.oracle,
                abi: oraclePriceAbi,
                functionName: 'getPrice',
                args: [budgetA.token.address, budgetB.token.address],
            });
            priceAB = price;
            priceUpdatedAt = updatedAt;
        } catch {
            return {
                status: 'opaque',
                reason: `oracle.getPrice(${budgetA.token.address}, ${budgetB.token.address}) reverted`,
                transfers: [],
                externalCalls: [],
                notes: [],
            };
        }
        if (priceAB === 0n) {
            return noOp('oracle price is 0');
        }
        // Staleness — the strategy refuses to fire when `block.timestamp >
        // updatedAt + maxStaleness`.  Without this check the simulator
        // predicts a phantom dispatch while on-chain the strategy
        // silently returns empty actions (same shape as the gate closing
        // for CowSwap, but without a visible knob).
        const block = await ctx.client.getBlock();
        if (
            node.maxStaleness !== 0n &&
            block.timestamp > priceUpdatedAt + node.maxStaleness
        ) {
            return noOp(
                `oracle stale: ${block.timestamp - priceUpdatedAt}s old, max ${node.maxStaleness}s`,
            );
        }

        // Pool reserves + on-chain ratio gate (matches the strategy's
        // `_poolRatioWithinSlippage` check).
        const factory = await ctx.client.readContract({
            address: node.router,
            abi: univ2RouterAbi,
            functionName: 'factory',
        });
        const pair = await ctx.client.readContract({
            address: factory,
            abi: univ2FactoryAbi,
            functionName: 'getPair',
            args: [budgetA.token.address, budgetB.token.address],
        });
        if (pair === zeroAddress) {
            return noOp(
                'UniV2 pair not deployed — strategy refuses cold-start',
            );
        }
        const [reserve0Raw, reserve1Raw] = await ctx.client.readContract({
            address: pair,
            abi: univ2PairAbi,
            functionName: 'getReserves',
        });
        const token0 = await ctx.client.readContract({
            address: pair,
            abi: univ2PairAbi,
            functionName: 'token0',
        });
        const reserveA =
            token0.toLowerCase() === budgetA.token.address.toLowerCase()
                ? BigInt(reserve0Raw)
                : BigInt(reserve1Raw);
        const reserveB =
            token0.toLowerCase() === budgetA.token.address.toLowerCase()
                ? BigInt(reserve1Raw)
                : BigInt(reserve0Raw);
        if (reserveA === 0n || reserveB === 0n) {
            return noOp('pool reserves are zero');
        }
        const poolPrice = (reserveB * PRICE_SCALE) / reserveA;
        const slippage = BigInt(node.maxSlippageBps);
        const upper = (priceAB * (SLIPPAGE_BASE + slippage)) / SLIPPAGE_BASE;
        const lower = (priceAB * (SLIPPAGE_BASE - slippage)) / SLIPPAGE_BASE;
        if (poolPrice > upper || poolPrice < lower) {
            return noOp(
                `pool ratio outside slippage band: pool=${poolPrice}, oracle=${priceAB}, ±${node.maxSlippageBps}bps`,
            );
        }

        // Binding-side selection at the oracle ratio.
        const quotedB = (budgetA.amount * priceAB) / PRICE_SCALE;
        let amountA: bigint;
        let amountB: bigint;
        if (quotedB <= budgetB.amount) {
            amountA = budgetA.amount;
            amountB = quotedB;
        } else {
            amountA = (budgetB.amount * PRICE_SCALE) / priceAB;
            amountB = budgetB.amount;
        }

        // LP minted is deterministic from the pair's totalSupply + reserves:
        // min(amountA·ts/reserveA, amountB·ts/reserveB). We can estimate it
        // pre-dispatch (the actual mint lands on-chain), so the canvas can show
        // the LP coming back to the recipient instead of a one-way arrow.
        let lpEstimate: bigint | undefined;
        try {
            const totalSupply = await ctx.client.readContract({
                address: pair,
                abi: univ2PairAbi,
                functionName: 'totalSupply',
            });
            if (totalSupply > 0n) {
                const lpA = (amountA * totalSupply) / reserveA;
                const lpB = (amountB * totalSupply) / reserveB;
                lpEstimate = lpA < lpB ? lpA : lpB;
            }
        } catch {
            // Leave undefined → opaque LP (still shown as a pending return).
        }
        // The pair is a standard 18-decimal UNI-V2 ERC20.
        const lpToken = { address: pair, symbol: 'UNI-V2', decimals: 18 };
        const lpToVault =
            node.lpRecipient.toLowerCase() === ctx.vault.toLowerCase();

        return {
            status: 'executed',
            budget: {
                amount: budgetA.amount,
                token: budgetA.token,
                provenance: budgetA.provenance,
            },
            transfers: lpToVault
                ? []
                : [
                      {
                          from: ctx.vault,
                          to: node.lpRecipient,
                          token: lpToken,
                          amount: lpEstimate ?? 0n,
                          provenance: lpEstimate
                              ? ('estimated-via-oracle' as const)
                              : ('opaque' as const),
                      },
                  ],
            externalCalls: [
                {
                    to: node.router,
                    description: `addLiquidity(${budgetA.token.symbol ?? 'A'}=${amountA}, ${
                        budgetB.token.symbol ?? 'B'
                    }=${amountB}) → LP to ${node.lpRecipient}`,
                    consumes: [
                        {
                            token: budgetA.token,
                            amount: amountA,
                            provenance: 'estimated-via-oracle',
                        },
                        {
                            token: budgetB.token,
                            amount: amountB,
                            provenance: 'estimated-via-oracle',
                        },
                    ],
                    // LP minted back to the DAO loops in as a `produces`; LP to a
                    // third party is modelled as a transfer (handled above).
                    produces: lpToVault
                        ? [
                              {
                                  token: lpToken,
                                  amount: lpEstimate ?? 0n,
                                  provenance: lpEstimate
                                      ? 'estimated-via-oracle'
                                      : 'opaque',
                              },
                          ]
                        : [],
                },
            ],
            notes: [
                lpToVault
                    ? `LP tokens minted back to the DAO vault${lpEstimate ? '' : ' (amount settles on-chain)'}`
                    : `LP tokens minted to ${node.lpRecipient}, not the DAO`,
                amountA < budgetA.amount
                    ? `${budgetA.amount - amountA} ${budgetA.token.symbol ?? 'A'} stays in the DAO (B was binding)`
                    : amountB < budgetB.amount
                      ? `${budgetB.amount - amountB} ${budgetB.token.symbol ?? 'B'} stays in the DAO (A was binding)`
                      : '',
            ].filter((s) => s.length > 0),
        };
    },
});

// --- Lido: GatedCowSwap -----------------------------------------------------

const priceFloorGateAbi = parseAbi(['function passes() view returns (bool)']);

registerPredictor({
    kind: 'strategy.dispatch.lido.gated-cowswap',
    predict: async (node, state, ctx) => {
        if (node.kind !== 'strategy.dispatch.lido.gated-cowswap') {
            throw new Error(`predictor kind mismatch: ${node.kind}`);
        }
        if (node.paused) {
            return skipPaused();
        }

        const currentEpoch = getEpoch(state, node.epochProvider.address);
        if (currentEpoch === undefined) {
            return noOp('epoch provider unreadable');
        }
        if (currentEpoch === node.lastEpoch) {
            return noOp('same epoch — slot already burned');
        }

        const gatePasses = await ctx.client.readContract({
            address: node.gate.address,
            abi: priceFloorGateAbi,
            functionName: 'passes',
        });
        if (!gatePasses) {
            return noOp('gate closed');
        }

        const budget = readBudget(node.budget, state);
        if (budget.wouldRevert) {
            return noOp(`budget would revert: ${budget.wouldRevert.reason}`, {
                amount: budget.amount,
                token: budget.token,
                provenance: budget.provenance,
            });
        }
        if (budget.amount === 0n) {
            return noOp('budget amount is zero', {
                amount: 0n,
                token: budget.token,
                provenance: budget.provenance,
            });
        }

        // CowSwap approve-only + presign at dispatch time: no balance change.
        // The buy-side amount only lands on a solver fill (off-chain), which
        // this preview can't model.  Estimate the minimum buy amount for the
        // UI so the user can compare against the post-fill state.
        let minBuy: {
            amount: bigint;
            provenance: 'estimated-via-oracle' | 'opaque';
        } = {
            amount: 0n,
            provenance: 'opaque',
        };
        try {
            const [price] = await ctx.client.readContract({
                address: node.priceOracle,
                abi: oraclePriceAbi,
                functionName: 'getPrice',
                args: [budget.token.address, node.targetToken.address],
            });
            const expected = (budget.amount * price) / PRICE_SCALE;
            const slippage = node.maxSlippageBps;
            const minBuyAmount =
                (expected * (SLIPPAGE_BASE - slippage)) / SLIPPAGE_BASE;
            minBuy = {
                amount: minBuyAmount,
                provenance: 'estimated-via-oracle',
            };
        } catch {
            // Leave minBuy as opaque
        }

        return {
            status: 'executed',
            budget: {
                amount: budget.amount,
                token: budget.token,
                provenance: budget.provenance,
            },
            transfers: [],
            externalCalls: [
                {
                    to: node.cowSwapSettlement,
                    description: `presign sell ${budget.amount} ${budget.token.symbol ?? '?'} → ≥${
                        minBuy.amount
                    } ${node.targetToken.symbol ?? '?'} (off-chain fill)`,
                    consumes: [],
                    // The buyback lands back in the DAO when the solver fills.
                    // We can estimate the minimum buy via the oracle, so the
                    // canvas shows the buyback returning (estimated) rather than
                    // a one-way sell arrow.
                    produces:
                        minBuy.amount > 0n
                            ? [
                                  {
                                      token: node.targetToken,
                                      amount: minBuy.amount,
                                      provenance: minBuy.provenance,
                                  },
                              ]
                            : [],
                },
            ],
            notes: [
                'approve + setPreSignature: no balance change at dispatch time',
                'solver fill is async — actual buy-side delta only lands when settled',
            ],
        };
    },
});

// --- Helpers ---------------------------------------------------------------

function skipPaused(): PredictResult {
    return {
        status: 'skipped-paused',
        reason: 'strategy.paused() === true',
        transfers: [],
        externalCalls: [],
        notes: [],
    };
}

function noOp(reason: string, budget?: PredictResult['budget']): PredictResult {
    return {
        status: 'no-op',
        reason,
        ...(budget === undefined ? {} : { budget }),
        transfers: [],
        externalCalls: [],
        notes: [],
    };
}

/** Build Transfer records from Solo/Equal/Ratio allocations. */
function buildTransfers(
    dao: `0x${string}`,
    node: Extract<
        StrategyNode,
        {
            kind:
                | 'strategy.dispatch.transfer'
                | 'strategy.dispatch.epoch-transfer';
        }
    >,
    allocations: ReturnType<typeof splitAllocations>['allocations'],
): Transfer[] {
    return allocations
        .filter((a) => a.amount > 0n)
        .map((a) => ({
            from: dao,
            to: a.recipient,
            token: node.budget.token,
            amount: a.amount,
            provenance: a.provenance,
        }));
}

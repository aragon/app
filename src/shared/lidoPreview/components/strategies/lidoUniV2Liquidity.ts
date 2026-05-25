// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Lido UniV2LiquidityDispatchStrategy inspector — reads the second budget
// (streamed wstETH), the V2 router, the price oracle, the epoch provider, the
// LP recipient, and the per-epoch lockout slot.

import { type Address, parseAbi } from 'viem';
import { uniV2LiquidityDispatchStrategyAbi } from '../../abi/generated/UniV2LiquidityDispatchStrategy';
import {
    dispatchBudget,
    dispatchEpochProvider,
} from '../../introspect/dispatch';
import { registerStrategy } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { LidoUniV2LiquidityDispatchStrategyNode } from '../../types/topology';

const ID = 'com.aragon.lido.strategy.dispatch.univ2-liquidity';

const baseAbi = parseAbi([
    'function paused() view returns (bool)',
    'function budget() view returns (address)',
]);

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<LidoUniV2LiquidityDispatchStrategyNode> {
    const [
        paused,
        budgetAAddress,
        budgetBAddress,
        router,
        oracle,
        epochProviderAddress,
        lpRecipient,
        maxSlippageBps,
        maxStaleness,
        lastEpoch,
    ] = await Promise.all([
        ctx.client.readContract({
            address,
            abi: baseAbi,
            functionName: 'paused',
        }),
        ctx.client.readContract({
            address,
            abi: baseAbi,
            functionName: 'budget',
        }),
        ctx.client.readContract({
            address,
            abi: uniV2LiquidityDispatchStrategyAbi,
            functionName: 'budgetB',
        }),
        ctx.client.readContract({
            address,
            abi: uniV2LiquidityDispatchStrategyAbi,
            functionName: 'router',
        }),
        ctx.client.readContract({
            address,
            abi: uniV2LiquidityDispatchStrategyAbi,
            functionName: 'oracle',
        }),
        ctx.client.readContract({
            address,
            abi: uniV2LiquidityDispatchStrategyAbi,
            functionName: 'epochProvider',
        }),
        ctx.client.readContract({
            address,
            abi: uniV2LiquidityDispatchStrategyAbi,
            functionName: 'lpRecipient',
        }),
        ctx.client.readContract({
            address,
            abi: uniV2LiquidityDispatchStrategyAbi,
            functionName: 'maxSlippageBps',
        }),
        ctx.client.readContract({
            address,
            abi: uniV2LiquidityDispatchStrategyAbi,
            functionName: 'maxStaleness',
        }),
        ctx.client.readContract({
            address,
            abi: uniV2LiquidityDispatchStrategyAbi,
            functionName: 'lastEpoch',
        }),
    ]);

    const [budget, budgetB, epochProvider] = await Promise.all([
        dispatchBudget(budgetAAddress, ctx),
        dispatchBudget(budgetBAddress, ctx),
        dispatchEpochProvider(epochProviderAddress, ctx),
    ]);

    return {
        kind: 'strategy.dispatch.lido.univ2-liquidity',
        address,
        strategyId: ID,
        paused,
        budget,
        budgetB,
        router,
        oracle,
        epochProvider,
        lpRecipient,
        maxSlippageBps: Number(maxSlippageBps),
        maxStaleness: BigInt(maxStaleness),
        lastEpoch: BigInt(lastEpoch),
    };
}

registerStrategy({
    id: ID,
    kind: 'strategy.dispatch.lido.univ2-liquidity',
    inspect,
});

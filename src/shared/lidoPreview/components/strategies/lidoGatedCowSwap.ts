// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Lido GatedCowSwapDispatchStrategy inspector — reads CR's CowSwap state
// (target token, settlement, oracle, slippage/staleness, safe-approval flag)
// plus the gate / epoch-provider additions.

import { type Address, parseAbi } from 'viem';
import { gatedCowSwapDispatchStrategyAbi } from '../../abi/generated/GatedCowSwapDispatchStrategy';
import {
    dispatchBudget,
    dispatchEpochProvider,
} from '../../introspect/dispatch';
import { fetchTokenInfo } from '../../introspect/token';
import { registerStrategy } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { LidoGatedCowSwapDispatchStrategyNode } from '../../types/topology';
import { inspectPriceFloorGate } from './_priceFloorGate';

const ID = 'com.aragon.lido.strategy.dispatch.gated-cowswap';

const baseAbi = parseAbi([
    'function paused() view returns (bool)',
    'function budget() view returns (address)',
]);

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<LidoGatedCowSwapDispatchStrategyNode> {
    const [
        paused,
        budgetAddress,
        targetTokenAddress,
        cowSwapSettlement,
        priceOracle,
        maxSlippageBps,
        maxStaleness,
        useSafeApproval,
        gateAddress,
        epochProviderAddress,
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
            abi: gatedCowSwapDispatchStrategyAbi,
            functionName: 'targetToken',
        }),
        ctx.client.readContract({
            address,
            abi: gatedCowSwapDispatchStrategyAbi,
            functionName: 'cowSwapSettlement',
        }),
        ctx.client.readContract({
            address,
            abi: gatedCowSwapDispatchStrategyAbi,
            functionName: 'priceOracle',
        }),
        ctx.client.readContract({
            address,
            abi: gatedCowSwapDispatchStrategyAbi,
            functionName: 'maxSlippageBps',
        }),
        ctx.client.readContract({
            address,
            abi: gatedCowSwapDispatchStrategyAbi,
            functionName: 'maxStaleness',
        }),
        ctx.client.readContract({
            address,
            abi: gatedCowSwapDispatchStrategyAbi,
            functionName: 'useSafeApproval',
        }),
        ctx.client.readContract({
            address,
            abi: gatedCowSwapDispatchStrategyAbi,
            functionName: 'gate',
        }),
        ctx.client.readContract({
            address,
            abi: gatedCowSwapDispatchStrategyAbi,
            functionName: 'epochProvider',
        }),
        ctx.client.readContract({
            address,
            abi: gatedCowSwapDispatchStrategyAbi,
            functionName: 'lastEpoch',
        }),
    ]);

    const [budget, targetToken, gate, epochProvider] = await Promise.all([
        dispatchBudget(budgetAddress, ctx),
        fetchTokenInfo(ctx.client, targetTokenAddress),
        inspectPriceFloorGate(gateAddress, ctx),
        dispatchEpochProvider(epochProviderAddress, ctx),
    ]);

    return {
        kind: 'strategy.dispatch.lido.gated-cowswap',
        address,
        strategyId: ID,
        paused,
        budget,
        targetToken,
        cowSwapSettlement,
        priceOracle,
        maxSlippageBps: BigInt(maxSlippageBps),
        maxStaleness: BigInt(maxStaleness),
        useSafeApproval,
        gate,
        epochProvider,
        lastEpoch: BigInt(lastEpoch),
    };
}

registerStrategy({
    id: ID,
    kind: 'strategy.dispatch.lido.gated-cowswap',
    inspect,
});

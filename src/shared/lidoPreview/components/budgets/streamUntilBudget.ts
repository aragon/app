// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Lido StreamUntilBudget inspector — reads the operator-paced stream state.
//
// `budget() = balance / max(targetEpoch − currentEpoch, floorEpochs)`.
// The inspector surfaces the configuration; the simulator's budget reader
// derives the per-tick number from `ChainState` + `currentEpoch`.

import type { Address } from 'viem';
import { streamUntilBudgetAbi } from '../../abi/generated/StreamUntilBudget';
import { dispatchEpochProvider } from '../../introspect/dispatch';
import { fetchTokenInfo } from '../../introspect/token';
import { registerBudget } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { LidoStreamUntilBudgetNode } from '../../types/topology';

const ID = 'com.aragon.lido.budget.stream-until';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<LidoStreamUntilBudgetNode> {
    const [
        vault,
        tokenAddress,
        epochProviderAddress,
        targetEpoch,
        floorEpochs,
    ] = await Promise.all([
        ctx.client.readContract({
            address,
            abi: streamUntilBudgetAbi,
            functionName: 'vault',
        }),
        ctx.client.readContract({
            address,
            abi: streamUntilBudgetAbi,
            functionName: 'token',
        }),
        ctx.client.readContract({
            address,
            abi: streamUntilBudgetAbi,
            functionName: 'epochProvider',
        }),
        ctx.client.readContract({
            address,
            abi: streamUntilBudgetAbi,
            functionName: 'targetEpoch',
        }),
        ctx.client.readContract({
            address,
            abi: streamUntilBudgetAbi,
            functionName: 'floorEpochs',
        }),
    ]);

    const [token, epochProvider] = await Promise.all([
        fetchTokenInfo(ctx.client, tokenAddress),
        dispatchEpochProvider(epochProviderAddress, ctx),
    ]);

    return {
        kind: 'budget.lido.stream-until',
        address,
        budgetId: ID,
        token,
        vault,
        epochProvider,
        targetEpoch: BigInt(targetEpoch),
        floorEpochs: Number(floorEpochs),
    };
}

registerBudget({ id: ID, kind: 'budget.lido.stream-until', inspect });

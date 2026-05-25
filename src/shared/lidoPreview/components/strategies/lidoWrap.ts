// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Lido WrapDispatchStrategy inspector — reads the wstETH wrapper address
// alongside the inherited `paused` + `budget` from DispatchStrategyBase.

import { type Address, parseAbi } from 'viem';
import { wrapDispatchStrategyAbi } from '../../abi/generated/WrapDispatchStrategy';
import { dispatchBudget } from '../../introspect/dispatch';
import { fetchTokenInfo } from '../../introspect/token';
import { registerStrategy } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { LidoWrapDispatchStrategyNode } from '../../types/topology';

const ID = 'com.aragon.lido.strategy.dispatch.wrap';

// Inherited from DispatchStrategyBase.  Kept inline so this file doesn't
// have to import a CR base-contract ABI we don't have generated.
const baseAbi = parseAbi([
    'function paused() view returns (bool)',
    'function budget() view returns (address)',
]);

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<LidoWrapDispatchStrategyNode> {
    const [paused, budgetAddress, wstETH] = await Promise.all([
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
            abi: wrapDispatchStrategyAbi,
            functionName: 'wstETH',
        }),
    ]);

    const [budget, wstETHToken] = await Promise.all([
        dispatchBudget(budgetAddress, ctx),
        fetchTokenInfo(ctx.client, wstETH),
    ]);

    return {
        kind: 'strategy.dispatch.lido.wrap',
        address,
        strategyId: ID,
        paused,
        budget,
        wstETH,
        wstETHToken,
    };
}

registerStrategy({ id: ID, kind: 'strategy.dispatch.lido.wrap', inspect });

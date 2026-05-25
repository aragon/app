// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import { burnDispatchStrategyAbi } from '../../abi/generated/BurnDispatchStrategy';
import { dispatchBudget } from '../../introspect/dispatch';
import { registerStrategy } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { BurnDispatchStrategyNode } from '../../types/topology';

const ID = 'org.aragon.strategy.dispatch.burn';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<BurnDispatchStrategyNode> {
    const [paused, budgetAddress] = await Promise.all([
        ctx.client.readContract({
            address,
            abi: burnDispatchStrategyAbi,
            functionName: 'paused',
        }),
        ctx.client.readContract({
            address,
            abi: burnDispatchStrategyAbi,
            functionName: 'budget',
        }),
    ]);

    const budget = await dispatchBudget(budgetAddress, ctx);

    return {
        kind: 'strategy.dispatch.burn',
        address,
        strategyId: ID,
        paused,
        budget,
    };
}

registerStrategy({ id: ID, kind: 'strategy.dispatch.burn', inspect });

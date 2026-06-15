// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import { transferDispatchStrategyAbi } from '../../abi/generated/TransferDispatchStrategy';
import { dispatchBudget, dispatchSplitter } from '../../introspect/dispatch';
import { registerStrategy } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { TransferDispatchStrategyNode } from '../../types/topology';

const ID = 'org.aragon.strategy.dispatch.transfer';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<TransferDispatchStrategyNode> {
    const [paused, budgetAddress, splitterAddress, useSafeTransfer] =
        await Promise.all([
            ctx.client.readContract({
                address,
                abi: transferDispatchStrategyAbi,
                functionName: 'paused',
            }),
            ctx.client.readContract({
                address,
                abi: transferDispatchStrategyAbi,
                functionName: 'budget',
            }),
            ctx.client.readContract({
                address,
                abi: transferDispatchStrategyAbi,
                functionName: 'splitter',
            }),
            ctx.client.readContract({
                address,
                abi: transferDispatchStrategyAbi,
                functionName: 'useSafeTransfer',
            }),
        ]);

    const [budget, splitter] = await Promise.all([
        dispatchBudget(budgetAddress, ctx),
        dispatchSplitter(splitterAddress, ctx),
    ]);

    return {
        kind: 'strategy.dispatch.transfer',
        address,
        strategyId: ID,
        paused,
        budget,
        splitter,
        useSafeTransfer,
    };
}

registerStrategy({ id: ID, kind: 'strategy.dispatch.transfer', inspect });

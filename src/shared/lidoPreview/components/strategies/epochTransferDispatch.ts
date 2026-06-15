// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import { epochTransferDispatchStrategyAbi } from '../../abi/generated/EpochTransferDispatchStrategy';
import {
    dispatchBudget,
    dispatchEpochProvider,
    dispatchSplitter,
} from '../../introspect/dispatch';
import { registerStrategy } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { EpochTransferDispatchStrategyNode } from '../../types/topology';

const ID = 'org.aragon.strategy.dispatch.epoch-transfer';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<EpochTransferDispatchStrategyNode> {
    const [
        paused,
        budgetAddress,
        splitterAddress,
        epochProviderAddress,
        lastDispatchedEpoch,
        useSafeTransfer,
    ] = await Promise.all([
        ctx.client.readContract({
            address,
            abi: epochTransferDispatchStrategyAbi,
            functionName: 'paused',
        }),
        ctx.client.readContract({
            address,
            abi: epochTransferDispatchStrategyAbi,
            functionName: 'budget',
        }),
        ctx.client.readContract({
            address,
            abi: epochTransferDispatchStrategyAbi,
            functionName: 'splitter',
        }),
        ctx.client.readContract({
            address,
            abi: epochTransferDispatchStrategyAbi,
            functionName: 'epochProvider',
        }),
        ctx.client.readContract({
            address,
            abi: epochTransferDispatchStrategyAbi,
            functionName: 'lastDispatchedEpoch',
        }),
        ctx.client.readContract({
            address,
            abi: epochTransferDispatchStrategyAbi,
            functionName: 'useSafeTransfer',
        }),
    ]);

    const [budget, splitter, epochProvider] = await Promise.all([
        dispatchBudget(budgetAddress, ctx),
        dispatchSplitter(splitterAddress, ctx),
        dispatchEpochProvider(epochProviderAddress, ctx),
    ]);

    return {
        kind: 'strategy.dispatch.epoch-transfer',
        address,
        strategyId: ID,
        paused,
        budget,
        splitter,
        epochProvider,
        lastDispatchedEpoch,
        useSafeTransfer,
    };
}

registerStrategy({
    id: ID,
    kind: 'strategy.dispatch.epoch-transfer',
    inspect,
});

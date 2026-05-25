// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import { dispatcherPluginAbi } from '../../abi/generated/DispatcherPlugin';
import { dispatchStrategy } from '../../introspect/dispatch';
import { registerPlugin } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { DispatcherPluginNode } from '../../types/topology';

const ID = 'org.aragon.plugin.dispatch';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<DispatcherPluginNode> {
    const [dao, strategyCount, failsafeStrategyMap] = await Promise.all([
        ctx.client.readContract({
            address,
            abi: dispatcherPluginAbi,
            functionName: 'dao',
        }),
        ctx.client.readContract({
            address,
            abi: dispatcherPluginAbi,
            functionName: 'strategyCount',
        }),
        ctx.client.readContract({
            address,
            abi: dispatcherPluginAbi,
            functionName: 'failsafeStrategyMap',
        }),
    ]);

    // Read every strategy address by index, then recurse in parallel.
    const indices = Array.from({ length: Number(strategyCount) }, (_, i) =>
        BigInt(i),
    );
    const strategyAddresses = await Promise.all(
        indices.map((i) =>
            ctx.client.readContract({
                address,
                abi: dispatcherPluginAbi,
                functionName: 'strategies',
                args: [i],
            }),
        ),
    );
    const strategies = await Promise.all(
        strategyAddresses.map((addr) => dispatchStrategy(addr, ctx)),
    );

    return {
        kind: 'plugin.dispatch',
        address,
        pluginId: ID,
        dao,
        strategies,
        failsafeStrategyMap,
    };
}

registerPlugin({ id: ID, kind: 'plugin.dispatch', inspect });

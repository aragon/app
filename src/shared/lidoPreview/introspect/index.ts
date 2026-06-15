// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address, PublicClient } from 'viem';
import type { IntrospectionContext } from '../registry/types';
import type { TopologyGraph, Warning } from '../types/topology';
import { dispatchPlugin } from './dispatch';

export type InspectOptions = {
    /** Block number to read at. Defaults to the chain's current block. */
    blockNumber?: bigint;
};

/**
 * Reads a deployed Capital Router plugin and returns its structural topology.
 * Unknown components are preserved as `*.unknown` nodes rather than errors.
 */
export async function inspect(
    client: PublicClient,
    pluginAddress: Address,
    options: InspectOptions = {},
): Promise<TopologyGraph> {
    const [chainId, blockNumber] = await Promise.all([
        client.getChainId(),
        options.blockNumber !== undefined
            ? Promise.resolve(options.blockNumber)
            : client.getBlockNumber(),
    ]);

    const warnings: Warning[] = [];
    const ctx: IntrospectionContext = {
        client,
        chainId,
        blockNumber,
        warn: (code, message, path) => {
            warnings.push(
                path === undefined
                    ? { code, message }
                    : { code, message, path },
            );
        },
    };

    const root = await dispatchPlugin(pluginAddress, ctx);

    return {
        version: 1,
        chainId,
        fetchedAtBlock: blockNumber,
        fetchedAt: new Date().toISOString(),
        root,
        warnings,
    };
}

export {
    dispatchBudget,
    dispatchEpochProvider,
    dispatchPlugin,
    dispatchSplitter,
    dispatchStrategy,
} from './dispatch';

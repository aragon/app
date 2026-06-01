// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Generic dispatchers: read the component's *Id() string, look it up in the
// registry, delegate to the matching inspector. Fall back to the unknown-*
// inspector when no match is registered.
//
// Note: inline `parseAbi` mini-ABIs instead of the generated interface ABIs.
// foundry (with via_ir) compiles the `external pure` id-getters into the
// interface JSON with `stateMutability: nonpayable`, which viem refuses to
// route through `readContract`.  Hand-written ABI fragments avoid the bad
// mutability and keep the introspection layer independent of forge output
// shape.

import { type Address, parseAbi } from 'viem';
import {
    findBudget,
    findPlugin,
    findSplitter,
    findStrategy,
} from '../registry/index';
import type { IntrospectionContext } from '../registry/types';
import type {
    BudgetNode,
    EpochProviderNode,
    PluginNode,
    SplitterNode,
    StrategyNode,
} from '../types/topology';
import {
    inspectUnknownBudget,
    inspectUnknownPlugin,
    inspectUnknownSplitter,
    inspectUnknownStrategy,
} from './unknown';

const pluginIdAbi = parseAbi(['function pluginId() view returns (string)']);
const strategyIdAbi = parseAbi(['function strategyId() view returns (string)']);
const budgetIdAbi = parseAbi(['function budgetId() view returns (string)']);
const splitterIdAbi = parseAbi(['function splitterId() view returns (string)']);
const getEpochAbi = parseAbi(['function getEpoch() view returns (uint256)']);

export async function dispatchPlugin(
    address: Address,
    ctx: IntrospectionContext,
): Promise<PluginNode> {
    const id = await ctx.client
        .readContract({
            address,
            abi: pluginIdAbi,
            functionName: 'pluginId',
        })
        .catch(() => null);

    if (id === null) {
        ctx.warn(
            'plugin.id-read-failed',
            `pluginId() call reverted at ${address} — treating as unknown plugin`,
        );
        return inspectUnknownPlugin(address, null, ctx);
    }

    const inspector = findPlugin(id);
    if (inspector) {
        return inspector.inspect(address, ctx);
    }

    ctx.warn(
        'plugin.unregistered',
        `No inspector registered for pluginId "${id}" at ${address}`,
    );
    return inspectUnknownPlugin(address, id, ctx);
}

export async function dispatchStrategy(
    address: Address,
    ctx: IntrospectionContext,
): Promise<StrategyNode> {
    const id = await ctx.client.readContract({
        address,
        abi: strategyIdAbi,
        functionName: 'strategyId',
    });

    const inspector = findStrategy(id);
    if (inspector) {
        return inspector.inspect(address, ctx);
    }

    ctx.warn(
        'strategy.unregistered',
        `No inspector registered for strategyId "${id}" at ${address}`,
    );
    return inspectUnknownStrategy(address, id, ctx);
}

export async function dispatchBudget(
    address: Address,
    ctx: IntrospectionContext,
): Promise<BudgetNode> {
    const id = await ctx.client.readContract({
        address,
        abi: budgetIdAbi,
        functionName: 'budgetId',
    });

    const inspector = findBudget(id);
    if (inspector) {
        return inspector.inspect(address, ctx);
    }

    ctx.warn(
        'budget.unregistered',
        `No inspector registered for budgetId "${id}" at ${address}`,
    );
    return inspectUnknownBudget(address, id, ctx);
}

export async function dispatchSplitter(
    address: Address,
    ctx: IntrospectionContext,
): Promise<SplitterNode> {
    const id = await ctx.client.readContract({
        address,
        abi: splitterIdAbi,
        functionName: 'splitterId',
    });

    const inspector = findSplitter(id);
    if (inspector) {
        return inspector.inspect(address, ctx);
    }

    ctx.warn(
        'splitter.unregistered',
        `No inspector registered for splitterId "${id}" at ${address}`,
    );
    return inspectUnknownSplitter(address, id, ctx);
}

/**
 * Epoch providers have no *Id() convention — there are many valid
 * implementations (gauges, tallies, time-based counters). We just read
 * `getEpoch()` and surface the current value.
 */
export async function dispatchEpochProvider(
    address: Address,
    ctx: IntrospectionContext,
): Promise<EpochProviderNode> {
    const currentEpoch = await ctx.client
        .readContract({
            address,
            abi: getEpochAbi,
            functionName: 'getEpoch',
        })
        .catch((err: unknown) => {
            ctx.warn(
                'epoch-provider.read-failed',
                `getEpoch() reverted at ${address}: ${String(err)}`,
            );
            return 0n;
        });

    return {
        kind: 'epoch-provider',
        address,
        currentEpoch,
    };
}

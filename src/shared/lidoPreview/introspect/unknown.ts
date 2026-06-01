// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Fallback inspectors for components whose *Id() string is not in the
// registry. They extract whatever generic data the interfaces guarantee and
// flag the node explicitly so the UI can render it as a black box.

import type { Address } from 'viem';
import { dispatcherPluginAbi } from '../abi/generated/DispatcherPlugin';
import { iDispatchBudgetAbi } from '../abi/generated/IDispatchBudget';
import { iDispatchStrategyAbi } from '../abi/generated/IDispatchStrategy';
import type { IntrospectionContext } from '../registry/types';
import type {
    UnknownBudgetNode,
    UnknownPluginNode,
    UnknownSplitterNode,
    UnknownStrategyNode,
} from '../types/topology';
import { dispatchBudget } from './dispatch';
import { fetchTokenInfo } from './token';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

export async function inspectUnknownPlugin(
    address: Address,
    pluginId: string | null,
    _ctx: IntrospectionContext,
): Promise<UnknownPluginNode> {
    // `dao()` is declared on the OSx Plugin base. Any Aragon plugin exposes it
    // with the same selector, so calling via DispatcherPlugin's ABI is safe
    // duck-typing — the contract either implements the selector or reverts.
    const dao = await _ctx.client
        .readContract({
            address,
            abi: dispatcherPluginAbi,
            functionName: 'dao',
        })
        .catch(() => null);

    return {
        kind: 'plugin.unknown',
        address,
        pluginId,
        dao,
    };
}

export async function inspectUnknownStrategy(
    address: Address,
    strategyId: string,
    ctx: IntrospectionContext,
): Promise<UnknownStrategyNode> {
    const [paused, budgetAddress] = await Promise.all([
        ctx.client
            .readContract({
                address,
                abi: iDispatchStrategyAbi,
                functionName: 'paused',
            })
            .catch(() => false),
        ctx.client
            .readContract({
                address,
                abi: iDispatchStrategyAbi,
                functionName: 'budget',
            })
            .catch(() => null),
    ]);

    // Best-effort: if the strategy exposes a budget, recurse into it. A known
    // budget under an unknown strategy is still useful for the UI.
    const budget = budgetAddress
        ? await dispatchBudget(budgetAddress, ctx).catch(() => null)
        : null;

    return {
        kind: 'strategy.unknown',
        address,
        strategyId,
        paused,
        budget,
    };
}

export async function inspectUnknownBudget(
    address: Address,
    budgetId: string,
    ctx: IntrospectionContext,
): Promise<UnknownBudgetNode> {
    const tokenAddress = await ctx.client
        .readContract({
            address,
            abi: iDispatchBudgetAbi,
            functionName: 'token',
        })
        .catch(() => null);

    if (!tokenAddress) {
        ctx.warn(
            'budget.unknown.token-read-failed',
            `token() reverted at unknown budget ${address}`,
        );
    }

    const token = tokenAddress
        ? await fetchTokenInfo(ctx.client, tokenAddress)
        : { address: ZERO_ADDRESS, symbol: null, decimals: null };

    return {
        kind: 'budget.unknown',
        address,
        budgetId,
        token,
    };
}

export async function inspectUnknownSplitter(
    address: Address,
    splitterId: string,
    _ctx: IntrospectionContext,
): Promise<UnknownSplitterNode> {
    return {
        kind: 'splitter.unknown',
        address,
        splitterId,
    };
}

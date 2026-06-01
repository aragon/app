// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import { requiredBudgetAbi } from '../../abi/generated/RequiredBudget';
import { fetchTokenInfo } from '../../introspect/token';
import { registerBudget } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { RequiredBudgetNode } from '../../types/topology';

const ID = 'org.aragon.budget.required';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<RequiredBudgetNode> {
    const [vault, tokenAddress, requiredAmount] = await Promise.all([
        ctx.client.readContract({
            address,
            abi: requiredBudgetAbi,
            functionName: 'vault',
        }),
        ctx.client.readContract({
            address,
            abi: requiredBudgetAbi,
            functionName: 'token',
        }),
        ctx.client.readContract({
            address,
            abi: requiredBudgetAbi,
            functionName: 'requiredBalance',
        }),
    ]);

    const token = await fetchTokenInfo(ctx.client, tokenAddress);

    return {
        kind: 'budget.required',
        address,
        budgetId: ID,
        token,
        vault,
        requiredAmount,
    };
}

registerBudget({ id: ID, kind: 'budget.required', inspect });

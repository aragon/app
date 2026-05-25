// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import { fullBudgetAbi } from '../../abi/generated/FullBudget';
import { fetchTokenInfo } from '../../introspect/token';
import { registerBudget } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { FullBudgetNode } from '../../types/topology';

const ID = 'org.aragon.budget.full';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<FullBudgetNode> {
    const [vault, tokenAddress] = await Promise.all([
        ctx.client.readContract({
            address,
            abi: fullBudgetAbi,
            functionName: 'vault',
        }),
        ctx.client.readContract({
            address,
            abi: fullBudgetAbi,
            functionName: 'token',
        }),
    ]);

    const token = await fetchTokenInfo(ctx.client, tokenAddress);

    return {
        kind: 'budget.full',
        address,
        budgetId: ID,
        token,
        vault,
    };
}

registerBudget({ id: ID, kind: 'budget.full', inspect });

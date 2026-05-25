// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import { equalSplitterAbi } from '../../abi/generated/EqualSplitter';
import { registerSplitter } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { EqualSplitterNode } from '../../types/topology';

const ID = 'org.aragon.splitter.equal';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<EqualSplitterNode> {
    // EqualSplitter overloads `recipients()` — the no-arg variant returns the
    // full array; the indexed variant returns one entry. We use the array form.
    const recipients = await ctx.client.readContract({
        address,
        abi: equalSplitterAbi,
        functionName: 'recipients',
        args: [],
    });
    return {
        kind: 'splitter.equal',
        address,
        splitterId: ID,
        recipients: [...recipients],
    };
}

registerSplitter({ id: ID, kind: 'splitter.equal', inspect });

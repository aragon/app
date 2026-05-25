// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import { soloSplitterAbi } from '../../abi/generated/SoloSplitter';
import { registerSplitter } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { SoloSplitterNode } from '../../types/topology';

const ID = 'org.aragon.splitter.solo';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<SoloSplitterNode> {
    const recipient = await ctx.client.readContract({
        address,
        abi: soloSplitterAbi,
        functionName: 'recipient',
    });
    return {
        kind: 'splitter.solo',
        address,
        splitterId: ID,
        recipient,
    };
}

registerSplitter({ id: ID, kind: 'splitter.solo', inspect });

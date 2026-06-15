// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import { ratioSplitterAbi } from '../../abi/generated/RatioSplitter';
import { registerSplitter } from '../../registry/index';
import type { IntrospectionContext } from '../../registry/types';
import type { RatioSplitterNode } from '../../types/topology';

const ID = 'org.aragon.splitter.ratio';

async function inspect(
    address: Address,
    ctx: IntrospectionContext,
): Promise<RatioSplitterNode> {
    const recipients = await ctx.client.readContract({
        address,
        abi: ratioSplitterAbi,
        functionName: 'recipients',
        args: [],
    });

    // `ratios` is a mapping(address => uint32); one call per recipient.
    // For splitters with many recipients, batching via multicall would be an
    // optimization — tracked in TASKS.md.
    const ratios = await Promise.all(
        recipients.map((recipient) =>
            ctx.client.readContract({
                address,
                abi: ratioSplitterAbi,
                functionName: 'ratios',
                args: [recipient],
            }),
        ),
    );

    return {
        kind: 'splitter.ratio',
        address,
        splitterId: ID,
        entries: recipients.map((recipient, i) => ({
            recipient,
            ratio: Number(ratios[i]),
        })),
    };
}

registerSplitter({ id: ID, kind: 'splitter.ratio', inspect });

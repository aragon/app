// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// PriceFloorGate inspector — auxiliary node attached to GatedCowSwap.
//
// Not registered against any *Id() because the gate has no id selector; the
// gated-cowswap inspector wires this in directly.  Lives under strategies/
// because that's the only component that consults it today.

import type { Address } from 'viem';
import { priceFloorGateAbi } from '../../abi/generated/PriceFloorGate';
import type { IntrospectionContext } from '../../registry/types';
import type { PriceFloorGateNode } from '../../types/topology';

export async function inspectPriceFloorGate(
    address: Address,
    ctx: IntrospectionContext,
): Promise<PriceFloorGateNode> {
    const [vault, oracle, tokenA, tokenB, threshold, maxStaleness] =
        await Promise.all([
            ctx.client.readContract({
                address,
                abi: priceFloorGateAbi,
                functionName: 'vault',
            }),
            ctx.client.readContract({
                address,
                abi: priceFloorGateAbi,
                functionName: 'oracle',
            }),
            ctx.client.readContract({
                address,
                abi: priceFloorGateAbi,
                functionName: 'tokenA',
            }),
            ctx.client.readContract({
                address,
                abi: priceFloorGateAbi,
                functionName: 'tokenB',
            }),
            ctx.client.readContract({
                address,
                abi: priceFloorGateAbi,
                functionName: 'threshold',
            }),
            ctx.client.readContract({
                address,
                abi: priceFloorGateAbi,
                functionName: 'maxStaleness',
            }),
        ]);

    return {
        kind: 'lido.price-floor-gate',
        address,
        vault,
        oracle,
        tokenA,
        tokenB,
        threshold: BigInt(threshold),
        maxStaleness: BigInt(maxStaleness),
    };
}

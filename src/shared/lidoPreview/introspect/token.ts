// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import { type Address, type PublicClient, parseAbi, zeroAddress } from 'viem';
import type { TokenInfo } from '../types/primitives';

// IERC20 is not a Capital Router contract, so no generated ABI exists. These
// two methods are universal ERC20 getters; a minimal local ABI is the
// straightforward way to read them.
const erc20MetadataAbi = parseAbi([
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
]);

/**
 * Best-effort ERC20 metadata read. Native ETH (`address(0)`) is hard-coded.
 * Non-compliant tokens that revert on either getter return null for that
 * field — the caller still gets a usable node.
 */
export async function fetchTokenInfo(
    client: PublicClient,
    address: Address,
): Promise<TokenInfo> {
    if (address === zeroAddress) {
        return { address, symbol: 'ETH', decimals: 18 };
    }

    const [symbol, decimals] = await Promise.all([
        client
            .readContract({
                address,
                abi: erc20MetadataAbi,
                functionName: 'symbol',
            })
            .catch(() => null),
        client
            .readContract({
                address,
                abi: erc20MetadataAbi,
                functionName: 'decimals',
            })
            .catch(() => null),
    ]);

    return {
        address,
        symbol,
        decimals: decimals === null ? null : Number(decimals),
    };
}

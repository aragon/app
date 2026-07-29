import { Network } from '@/shared/api/daoService';

/**
 * Per-network shortname used as the leading segment of the delegate-statement
 * ENS text-record key: `<shortname>.<tokenAddress>.delegate`.
 *
 * Citation: EIP-3770 chain shortnames (https://eips.ethereum.org/EIPS/eip-3770)
 * via the ethereum-lists/chains registry. Safe URLs derive from the same source.
 *
 * Mainnets use their canonical EIP-3770 shortname so records align with the
 * convention any third-party tool would recognise. Testnets all share the
 * generic `test` namespace rather than their canonical shortnames (`sep`).
 * Two reasons:
 * 1. ENS records live on mainnet regardless of the token's chain. Writing
 *    `sep.<token>.delegate` against a real ENS name pollutes the canonical
 *    Sepolia namespace with throwaway QA data.
 * 2. ENS hasn't ratified a cross-chain convention. If they pick a different
 *    shape later, we want the migration surface to be QA-only — no real
 *    production records to rewrite.
 *
 * Adding a network: extend the Network enum first; TypeScript will require a
 * corresponding entry here at compile time.
 */
export const NETWORK_EIP3770_SHORTNAME: Record<Network, string> = {
    [Network.ETHEREUM_MAINNET]: 'eth',
    [Network.POLYGON_MAINNET]: 'pol',
    [Network.BASE_MAINNET]: 'base',
    [Network.ARBITRUM_MAINNET]: 'arb1',
    [Network.OPTIMISM_MAINNET]: 'oeth',
    [Network.AVAX_MAINNET]: 'avax',
    [Network.ZKSYNC_MAINNET]: 'zksync',
    [Network.CHILIZ_MAINNET]: 'chzmainnet',
    [Network.PEAQ_MAINNET]: 'PEAQ',
    [Network.CITREA_MAINNET]: 'citrea',
    [Network.HEMI_MAINNET]: 'hemi',
    [Network.KATANA_MAINNET]: 'katana',
    [Network.MONAD_MAINNET]: 'monad',
    [Network.ETHEREUM_SEPOLIA]: 'test',
};

export interface IBuildEnsDelegateKeyParams {
    network: Network;
    tokenAddress: string;
}

/**
 * Builds the ENS text-record key that anchors a per-token delegate statement.
 */
export const buildEnsDelegateKey = (
    params: IBuildEnsDelegateKeyParams,
): string => {
    const { network, tokenAddress } = params;
    const shortname = NETWORK_EIP3770_SHORTNAME[network];

    return `${shortname}.${tokenAddress.toLowerCase()}.delegate`;
};

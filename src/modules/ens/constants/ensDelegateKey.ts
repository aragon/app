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
 * generic `test` namespace rather than their canonical shortnames (`sep`,
 * `zksync-sepolia`). Two reasons:
 * 1. ENS records live on mainnet regardless of the token's chain. Writing
 *    `sep.<token>.delegate` against a real ENS name pollutes the canonical
 *    Sepolia namespace with throwaway QA data.
 * 2. ENS hasn't ratified a cross-chain convention. If they pick a different
 *    shape later, we want the migration surface to be QA-only — no real
 *    production records to rewrite.
 *
 * Cross-testnet collision (the same token address on Sepolia and zkSync
 * Sepolia from the same publisher) is possible but inconsequential — testnet
 * deployments are throwaway.
 *
 * Citrea and Katana are not yet on the canonical EIP-3770 list (Citrea
 * mainnet is not live as of 2026-05; Katana is a recent L2 without an
 * assigned shortname). The values here mirror the chain name and will be
 * reconciled to the canonical shortname when one is published.
 *
 * Adding a network: extend the Network enum first; TypeScript will require a
 * corresponding entry here at compile time.
 */
export const NETWORK_EIP3770_SHORTNAME: Record<Network, string> = {
    [Network.ETHEREUM_MAINNET]: 'eth',
    [Network.POLYGON_MAINNET]: 'matic',
    [Network.BASE_MAINNET]: 'base',
    [Network.ARBITRUM_MAINNET]: 'arb1',
    [Network.OPTIMISM_MAINNET]: 'oeth',
    [Network.AVAX_MAINNET]: 'avax',
    [Network.ZKSYNC_MAINNET]: 'zksync',
    [Network.CHILIZ_MAINNET]: 'chz',
    [Network.PEAQ_MAINNET]: 'peaq',
    [Network.CITREA_MAINNET]: 'citrea',
    [Network.KATANA_MAINNET]: 'katana',
    [Network.ETHEREUM_SEPOLIA]: 'test',
    [Network.ZKSYNC_SEPOLIA]: 'test',
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

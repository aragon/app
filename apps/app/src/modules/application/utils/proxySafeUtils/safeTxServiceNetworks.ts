import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

/**
 * Chain short names used by the Safe transaction service, keyed by app network. Networks absent
 * from this map are not served by Safe (Citrea, Chiliz) — a first-class "unsupported" state, not
 * a failure. This module holds no secrets and is safe to import from client code.
 */
export const safeTxServiceShortNames: Partial<Record<Network, string>> = {
    [Network.ETHEREUM_MAINNET]: 'eth',
    [Network.ETHEREUM_SEPOLIA]: 'sep',
    [Network.POLYGON_MAINNET]: 'pol',
    [Network.BASE_MAINNET]: 'base',
    [Network.ARBITRUM_MAINNET]: 'arb1',
    [Network.OPTIMISM_MAINNET]: 'oeth',
    [Network.AVAX_MAINNET]: 'avax',
    [Network.ZKSYNC_MAINNET]: 'zksync',
    [Network.HEMI_MAINNET]: 'hemi',
    [Network.KATANA_MAINNET]: 'katana',
    [Network.MONAD_MAINNET]: 'monad',
};

/**
 * Resolves the app network matching the given chain-id, or undefined when the chain-id is
 * unknown to the app. The chain-id is the only thing taken from the request — nothing the caller
 * claims about a Safe is trusted.
 */
export const safeNetworkFromChainId = (
    chainId: string,
): Network | undefined => {
    const parsedChainId = Number(chainId);

    if (!Number.isInteger(parsedChainId)) {
        return undefined;
    }

    return Object.values(Network).find(
        (network) => networkDefinitions[network].id === parsedChainId,
    );
};

/**
 * Resolves the Safe transaction service short name for a network, or undefined when the network
 * is not served.
 */
export const safeShortNameFromNetwork = (
    network: Network,
): string | undefined => safeTxServiceShortNames[network];

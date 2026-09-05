import { Network } from '@/shared/api/daoService';
import { checksumSafeAddress } from '@/shared/api/safeService/safeAddressUtils';
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

/**
 * Addresses a Safe in the Safe web app, EIP-3770 style (`<shortName>:<checksummedAddress>`). The app
 * rejects any other casing, so the address is canonicalised here rather than trusted from the
 * caller.
 *
 * Undefined when Safe does not serve the network, so a caller renders plain text instead of a link
 * that cannot resolve.
 */
const safeAppUrl = (
    path: string,
    params: { network: Network; address: string },
): string | undefined => {
    const { network, address } = params;
    const shortName = safeShortNameFromNetwork(network);

    if (shortName == null) {
        return undefined;
    }

    return `https://app.safe.global/${path}?safe=${shortName}:${checksumSafeAddress(address)}`;
};

/**
 * Link to a Safe's own account page in the Safe web app.
 */
export const safeAppAccountUrl = (params: {
    network: Network;
    address: string;
}): string | undefined => safeAppUrl('home', params);

/**
 * Link to a Safe's executed transactions in the Safe web app.
 *
 * The Safe's history rather than one transaction: a deep link needs the `safeTxHash`, which is only
 * available while the transaction is still queued - the queue read serves unexecuted transactions,
 * and Aragon's indexed body result carries no transaction hash.
 */
export const safeAppHistoryUrl = (params: {
    network: Network;
    address: string;
}): string | undefined => safeAppUrl('transactions/history', params);

import { Network } from '@/shared/api/daoService';
import { checksumSafeAddress } from '@/shared/api/safeService/safeAddressUtils';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

/**
 * Chain short names used by the Safe transaction service, keyed by app network. `null` marks a
 * network Safe does not serve — a first-class "unsupported" state, not a failure. This module
 * holds no secrets and is safe to import from client code.
 *
 * Every network must have an entry, so adding a network fails to compile until its Safe support
 * is decided. Check it against Safe's list:
 * https://docs.safe.global/core-api/transaction-service-supported-networks
 *
 * The value is the transaction service path segment (the last segment of its `txServiceUrl`). It
 * usually matches the Safe app link prefix (Safe's `shortName`); where it doesn't, the prefix goes
 * in `safeAppShortNameOverrides`.
 */
export const safeTxServiceShortNames: Record<Network, string | null> = {
    [Network.ETHEREUM_MAINNET]: 'eth',
    [Network.ETHEREUM_SEPOLIA]: 'sep',
    [Network.ETHEREUM_HOODI]: null,
    [Network.POLYGON_MAINNET]: 'pol',
    [Network.POLYGON_AMOY]: null,
    [Network.BASE_MAINNET]: 'base',
    [Network.BASE_SEPOLIA]: 'basesep',
    [Network.ARBITRUM_MAINNET]: 'arb1',
    [Network.OPTIMISM_MAINNET]: 'oeth',
    [Network.AVAX_MAINNET]: 'avax',
    [Network.ZKSYNC_MAINNET]: 'zksync',
    [Network.HEMI_MAINNET]: 'hemi',
    [Network.KATANA_MAINNET]: 'katana',
    [Network.MONAD_MAINNET]: 'monad',
    [Network.ROBINHOOD_MAINNET]: 'robinhood',
    [Network.BNB_MAINNET]: 'bnb',
    [Network.BNB_TESTNET]: null,
    [Network.CITREA_MAINNET]: null,
    [Network.CHILIZ_MAINNET]: null,
};

/**
 * Safe app link prefixes (Safe's config service `shortName`) for the networks where they differ
 * from the transaction service path segment in `safeTxServiceShortNames`.
 */
const safeAppShortNameOverrides: Partial<Record<Network, string>> = {
    [Network.POLYGON_MAINNET]: 'matic',
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
): string | undefined => safeTxServiceShortNames[network] ?? undefined;

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
    query?: Record<string, string>,
): string | undefined => {
    const { network, address } = params;
    const txServiceShortName = safeShortNameFromNetwork(network);

    if (txServiceShortName == null) {
        return undefined;
    }

    const shortName = safeAppShortNameOverrides[network] ?? txServiceShortName;

    // Assembled by hand rather than with `URLSearchParams`: it percent-encodes the colon in the
    // EIP-3770 `safe=<shortName>:<address>` pair, and every value here is already URL-safe.
    const search = [
        `safe=${shortName}:${checksumSafeAddress(address)}`,
        ...Object.entries(query ?? {}).map(([key, value]) => `${key}=${value}`),
    ].join('&');

    return `https://app.safe.global/${path}?${search}`;
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
 */
export const safeAppHistoryUrl = (params: {
    network: Network;
    address: string;
}): string | undefined => safeAppUrl('transactions/history', params);

/**
 * Link to one transaction in the Safe web app.
 *
 * Both query parameters are required for the page to resolve, and the transaction id is
 * `multisig_<safeAddress>_<safeTxHash>` - the Safe address appears twice by design.
 */
export const safeAppTransactionUrl = (params: {
    network: Network;
    address: string;
    safeTxHash: string;
}): string | undefined => {
    const { network, address, safeTxHash } = params;
    const safeAddress = checksumSafeAddress(address);

    return safeAppUrl(
        'transactions/tx',
        { network, address },
        { id: `multisig_${safeAddress}_${safeTxHash}` },
    );
};

import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

class NetworkUtils {
    /**
     * Gets all supported networks from the network definitions.
     * @returns Array of all supported network identifiers
     */
    getSupportedNetworks = (): Network[] =>
        Object.keys(networkDefinitions) as Network[];

    /**
     * Gets only mainnet networks (excludes testnets) from the network definitions.
     * @returns Array of mainnet network identifiers
     */
    getMainnetNetworks = (): Network[] => {
        const networks = this.getSupportedNetworks();
        return networks.filter(
            (network) => !networkDefinitions[network].testnet,
        );
    };

    /**
     * Gets the network matching the given standard chain id.
     * @param chainId - Standard EVM chain id to resolve.
     * @returns The matching network, or undefined when the chain is not supported by the app.
     */
    getNetworkByChainId = (chainId: number): Network | undefined =>
        this.getSupportedNetworks().find(
            (network) => networkDefinitions[network].id === chainId,
        );

    /**
     * Checks if given value is a valid Network.
     * @param network
     */
    isValidNetwork = (network: unknown): boolean =>
        Object.values(Network).includes(network as Network);
}

export const networkUtils = new NetworkUtils();

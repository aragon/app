import type { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

class NetworkUtils {
    /**
     * Gets all supported networks from the network definitions.
     * @returns Array of all supported network identifiers
     */
    getSupportedNetworks = (): Network[] => {
        return Object.keys(networkDefinitions) as Network[];
    };

    /**
     * Gets only mainnet networks (excludes testnets) from the network definitions.
     * @returns Array of mainnet network identifiers
     */
    getMainnetNetworks = (): Network[] => {
        const networks = this.getSupportedNetworks();
        return networks.filter((network) => !networkDefinitions[network].testnet);
    };
}

export const networkUtils = new NetworkUtils();

import { Network } from '../api/daoService';

export interface INetworkDefinition {
    /**
     * Chain ID of the network.
     */
    chainId: number;
    /**
     * Name of the network.
     */
    name: string;
}

export const networkDefinitions: Record<Network, INetworkDefinition> = {
    [Network.ETHEREUM_MAINNET]: {
        chainId: 1,
        name: 'Ethereum Mainnet',
    },
    [Network.ETHEREUM_SEPOLIA]: {
        chainId: 11155111,
        name: 'Ethereum Sepolia',
    },
    [Network.POLYGON_MAINNET]: {
        chainId: 137,
        name: 'Polygon Mainnet',
    },
};

export enum Network {
  ETHEREUM_MAINNET = 'ETHEREUM_MAINNET',
  ETHEREUM_SEPOLIA = 'ETHEREUM_SEPOLIA',
  POLYGON_MAINNET = 'POLYGON_MAINNET',
}

export interface INetworkDefinition {
  chainId: number;
  name: string;
}

export const networkDefinitions: Record<Network, INetworkDefinition> = {
  [Network.ETHEREUM_MAINNET]: { 
    chainId: 1,
    name: 'Ethereum Mainnet',
  },
  [Network.ETHEREUM_SEPOLIA]: { 
    chainId: 2,
    name: 'Ethereum Sepolia',
  },
  [Network.POLYGON_MAINNET]: { 
    chainId: 137,
    name: 'Polygon Mainnet',
  },
};
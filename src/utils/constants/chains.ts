/* SUPPORTED NETWORK TYPES ================================================== */

import {i18n} from '../../../i18n.config';

export const SUPPORTED_CHAIN_ID = [
  1, 5, 137, 8453, 80001, 84531, 42161, 421613, 11155111,
] as const;

export type SupportedChainID = (typeof SUPPORTED_CHAIN_ID)[number];

export function isSupportedChainId(
  chainId: number
): chainId is SupportedChainID {
  return SUPPORTED_CHAIN_ID.some(id => id === chainId);
}

// Networks supported by the Gasless voting plugin
export const GASLESS_SUPPORTED_NETWORKS: SupportedNetworks[] = ['sepolia'];

// TODO: Remove this Goerli based network conditions
export const ENS_SUPPORTED_NETWORKS: SupportedNetworks[] = ['ethereum'];
export const NETWORKS_WITH_CUSTOM_REGISTRY: SupportedNetworks[] = [
  'arbitrum',
  'base',
  'polygon',
  'sepolia',
];

export const L2_NETWORKS = NETWORKS_WITH_CUSTOM_REGISTRY;

// TODO: Remove this Goerli based network conditions
const SUPPORTED_NETWORKS = [
  'arbitrum',
  'base',
  'ethereum',
  'polygon',
  'sepolia',
] as const;

export const GOERLI_BASED_NETWORKS: string[] = [
  'goerli',
  'base-goerli',
  'arbitrum-goerli',
  'mumbai',
];

export type SupportedNetworks =
  | (typeof SUPPORTED_NETWORKS)[number]
  | 'unsupported';

export function toSupportedNetwork(network: string): SupportedNetworks {
  return SUPPORTED_NETWORKS.some(n => n === network)
    ? (network as SupportedNetworks)
    : 'unsupported';
}

/**
 * Get the network name with given chain id
 * @param chainId Chain id
 * @returns the name of the supported network or null if network is unsupported
 */
export function getSupportedNetworkByChainId(
  chainId: number
): SupportedNetworks | undefined {
  if (isSupportedChainId(chainId)) {
    return Object.entries(CHAIN_METADATA).find(
      entry => entry[1].id === chainId
    )?.[0] as SupportedNetworks;
  }
}

export type NetworkDomain = 'L1 Blockchain' | 'L2 Blockchain';

/* CHAIN DATA =============================================================== */

export type NativeTokenData = {
  name: string;
  symbol: string;
  decimals: number;
};

export type ApiMetadata = {
  networkId: string;
  nativeTokenId: string;
};

export type ChainData = {
  id: SupportedChainID;
  name: string;
  domain: NetworkDomain;
  isTestnet: boolean;
  mainnet?: SupportedNetworks;
  explorer: string;
  explorerName: string;
  logo: string;
  // Public RPC endpoints only used to setup the network on MetaMask
  publicRpc: string;
  gatewayNetwork: string;
  nativeCurrency: NativeTokenData;
  etherscanApi: string;
  etherscanApiKey?: string;
  covalent?: ApiMetadata;
  coingecko?: ApiMetadata;
  supportsEns: boolean;
};

const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
const polygonscanApiKey = import.meta.env.VITE_POLYGONSCAN_API_KEY;
const arbiscanApiKey = import.meta.env.VITE_ARBISCAN_API_KEY;
const basecanApiKey = import.meta.env.VITE_BASESCAN_API_KEY;

export const CHAIN_METADATA: Record<SupportedNetworks, ChainData> = {
  ethereum: {
    id: 1,
    name: i18n.t('explore.modal.filterDAOs.label.ethereum'),
    domain: 'L1 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://etherscan.io/',
    explorerName: 'Etherscan',
    isTestnet: false,
    publicRpc: 'https://ethereum.publicnode.com',
    gatewayNetwork: 'ethereum/mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/api',
    etherscanApiKey: etherscanApiKey,
    coingecko: {
      networkId: 'ethereum',
      nativeTokenId: 'ethereum',
    },
    covalent: {
      networkId: 'eth-mainnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: true,
  },
  polygon: {
    id: 137,
    name: i18n.t('explore.modal.filterDAOs.label.polygon'),
    domain: 'L2 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png?1624446912',
    explorer: 'https://polygonscan.com/',
    explorerName: 'Polygonscan',
    isTestnet: false,
    publicRpc: 'https://polygon-bor.publicnode.com',
    gatewayNetwork: 'polygon/mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    etherscanApi: 'https://api.polygonscan.com/api',
    etherscanApiKey: polygonscanApiKey,
    coingecko: {
      networkId: 'polygon-pos',
      nativeTokenId: 'matic-network',
    },
    covalent: {
      networkId: 'matic-mainnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: false,
  },

  arbitrum: {
    id: 42161,
    name: i18n.t('explore.modal.filterDAOs.label.arbitrum'),
    domain: 'L2 Blockchain',
    logo: 'https://bridge.arbitrum.io/logo.png',
    explorer: 'https://arbiscan.io/',
    explorerName: 'Arbiscan',
    isTestnet: false,
    publicRpc: 'https://arb1.arbitrum.io/rpc',
    gatewayNetwork: 'arbitrum/mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.arbiscan.io/api',
    etherscanApiKey: arbiscanApiKey,
    coingecko: {
      networkId: 'arbitrum-one',
      nativeTokenId: 'ethereum',
    },
    covalent: {
      networkId: 'arbitrum-mainnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: false,
  },
  base: {
    id: 8453,
    name: i18n.t('explore.modal.filterDAOs.label.base'),
    domain: 'L2 Blockchain',
    logo: 'https://mirror-media.imgix.net/publication-images/cgqxxPdUFBDjgKna_dDir.png?h=250&w=250',
    explorer: 'https://basescan.org/',
    explorerName: 'Basescan',
    isTestnet: false,
    publicRpc: 'https://mainnet.base.org',
    gatewayNetwork: 'base/mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.basescan.org/api',
    etherscanApiKey: basecanApiKey,
    covalent: {
      networkId: 'base-mainnet',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: false,
  },
  sepolia: {
    id: 11155111,
    name: i18n.t('explore.modal.filterDAOs.label.ethereumSepolia'),
    domain: 'L1 Blockchain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://sepolia.etherscan.io/',
    isTestnet: true,
    explorerName: 'Etherscan',
    mainnet: 'ethereum',
    publicRpc: 'https://ethereum-sepolia.publicnode.com',
    gatewayNetwork: 'ethereum/sepolia',
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api-sepolia.etherscan.io/api',
    etherscanApiKey: etherscanApiKey,
    covalent: {
      networkId: 'eth-sepolia',
      nativeTokenId: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    },
    supportsEns: false,
  },
  unsupported: {
    id: 1,
    name: 'Unsupported',
    domain: 'L1 Blockchain',
    logo: '',
    explorer: '',
    explorerName: '',
    isTestnet: false,
    publicRpc: '',
    gatewayNetwork: '',
    nativeCurrency: {
      name: '',
      symbol: '',
      decimals: 18,
    },
    etherscanApi: '',
    supportsEns: false,
  },
};

export const chainExplorerAddressLink = (
  network: SupportedNetworks,
  address: string
) => {
  return `${CHAIN_METADATA[network].explorer}address/${address}`;
};

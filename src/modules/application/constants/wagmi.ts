import { createClient } from 'viem';
import { createConfig, http } from 'wagmi';
import { arbitrum, base, mainnet, polygon, sepolia, zkSync, zkSyncSepoliaTestnet } from 'wagmi/chains';

export const wagmiConfig = createConfig({
    chains: [arbitrum, base, mainnet, polygon, sepolia, zkSync, zkSyncSepoliaTestnet],
    client: ({ chain }) => createClient({ chain, transport: http() }),
});

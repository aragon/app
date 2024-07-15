import { createConfig, http } from 'wagmi';
import { arbitrum, mainnet, polygon, sepolia } from 'wagmi/chains';

export const wagmiConfig = createConfig({
    chains: [mainnet, sepolia, polygon, arbitrum],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [polygon.id]: http(),
        [arbitrum.id]: http(),
    },
});

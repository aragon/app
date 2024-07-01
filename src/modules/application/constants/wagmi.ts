import { createConfig, http } from 'wagmi';
import { mainnet, polygon, sepolia } from 'wagmi/chains';

export const wagmiConfig = createConfig({
    chains: [mainnet, sepolia, polygon],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [polygon.id]: http(),
    },
});

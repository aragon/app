import { defineChain } from 'viem';

export const peaq = defineChain({
    id: 3338,
    name: 'Peaq',
    nativeCurrency: { decimals: 18, name: 'Peaq', symbol: 'PEAQ' },
    rpcUrls: {
        default: {
            http: ['https://peaq.api.onfinality.io/public'],
            webSocket: ['wss://peaq.api.onfinality.io/public'],
        },
    },
    blockExplorers: {
        default: { name: 'Subscan', url: 'https://peaq.subscan.io' },
    },
});

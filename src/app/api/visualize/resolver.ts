import { capitalFlowAddresses } from '@/modules/capitalFlow/constants/capitalFlowAddresses';

const KNOWN_LABELS: Record<string, string> = {
    // Sepolia specific core contracts
    ['0x824d4AAD1cbF2327c4C429E3c97F968Ee19344F8'.toLowerCase()]: 'DAO Base',
    ['0x7a20760b89EF507759DD2c5A0d1f1657614341A9'.toLowerCase()]: 'Global Executor',
};

// Add capital flow addresses
// Add capital flow addresses
Object.values(capitalFlowAddresses).forEach((networkAddresses) => {
    Object.entries(networkAddresses).forEach(([label, address]) => {
        if (typeof address === 'string') {
            KNOWN_LABELS[address.toLowerCase()] = label;
        }
    });
});

export function resolveAddress(address: string): { label: string; type?: string } {
    const normalizeAddr = address.toLowerCase();

    if (KNOWN_LABELS[normalizeAddr]) {
        return { label: KNOWN_LABELS[normalizeAddr], type: 'CONTRACT' };
    }

    return { label: `${address.slice(0, 6)}...${address.slice(-4)}`, type: 'WALLET' };
}

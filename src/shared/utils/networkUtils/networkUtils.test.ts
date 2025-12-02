import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { networkUtils } from './networkUtils';

describe('network utils', () => {
    describe('getSupportedNetworks', () => {
        it('returns all supported networks from network definitions', () => {
            const result = networkUtils.getSupportedNetworks();
            const expectedNetworks = Object.keys(networkDefinitions) as Network[];
            expect(result).toEqual(expectedNetworks);
        });
    });

    describe('getMainnetNetworks', () => {
        it('returns only mainnet networks (excludes testnets)', () => {
            const result = networkUtils.getMainnetNetworks();

            // Should include mainnet networks
            expect(result).toContain(Network.ETHEREUM_MAINNET);
            expect(result).toContain(Network.POLYGON_MAINNET);
            expect(result).toContain(Network.BASE_MAINNET);
            expect(result).toContain(Network.ARBITRUM_MAINNET);
            expect(result).toContain(Network.OPTIMISM_MAINNET);
            expect(result).toContain(Network.ZKSYNC_MAINNET);
            expect(result).toContain(Network.CORN_MAINNET);
            expect(result).toContain(Network.PEAQ_MAINNET);
            expect(result).toContain(Network.KATANA_MAINNET);

            // Should not include testnet networks
            expect(result).not.toContain(Network.ETHEREUM_SEPOLIA);
            expect(result).not.toContain(Network.ZKSYNC_SEPOLIA);
        });
    });
});

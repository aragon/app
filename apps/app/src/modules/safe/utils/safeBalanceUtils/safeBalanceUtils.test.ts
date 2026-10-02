import { generateSafeBalance } from '@/shared/testUtils';
import { safeBalanceUtils } from './safeBalanceUtils';

describe('safeBalanceUtils', () => {
    const nativeCurrency = { name: 'Ether', symbol: 'ETH', decimals: 18 };

    describe('getBalanceAsset', () => {
        it('falls back to the native currency of the chain when the balance has no token', () => {
            const balance = generateSafeBalance({
                tokenAddress: null,
                token: null,
                balance: '1500000000000000000',
            });

            expect(
                safeBalanceUtils.getBalanceAsset({ balance, nativeCurrency }),
            ).toEqual({
                name: 'Ether',
                symbol: 'ETH',
                amount: '1.5',
                logoSrc: undefined,
                tokenAddress: undefined,
            });
        });

        it('uses the token metadata and decimals when the balance is an ERC-20', () => {
            const balance = generateSafeBalance({
                tokenAddress: '0xTokenAddress',
                token: {
                    name: 'USD Coin',
                    symbol: 'USDC',
                    decimals: 6,
                    logoUri: 'https://logo.test/usdc.png',
                },
                balance: '2500000',
            });

            expect(
                safeBalanceUtils.getBalanceAsset({ balance, nativeCurrency }),
            ).toEqual({
                name: 'USD Coin',
                symbol: 'USDC',
                amount: '2.5',
                logoSrc: 'https://logo.test/usdc.png',
                tokenAddress: '0xTokenAddress',
            });
        });
    });
});

import type { IAsset } from '../../api/financeService';
import { assetUtils } from './assetUtils';

describe('asset utils', () => {
    const buildAsset = (asset?: Partial<IAsset>): IAsset =>
        ({
            amount: '10',
            amountUsd: '20',
            token: {
                name: 'Ether',
                symbol: 'ETH',
                priceUsd: '2',
            },
            ...asset,
        }) as IAsset;

    describe('normalizeAsset', () => {
        it('keeps a priced asset as it is', () => {
            const result = assetUtils.normalizeAsset(buildAsset());

            expect(result.amount).toEqual('10');
            expect(result.token.priceUsd).toEqual('2');
        });

        it('derives the unit price from the amounts when the backend reports none', () => {
            const asset = buildAsset({
                amount: '4',
                amountUsd: '10',
                token: {
                    name: 'Ether',
                    symbol: 'ETH',
                    priceUsd: '0',
                } as IAsset['token'],
            });

            expect(assetUtils.normalizeAsset(asset).token.priceUsd).toEqual(
                '2.5',
            );
        });

        it('keeps a zero price when there is no value to derive it from', () => {
            const asset = buildAsset({
                amount: '4',
                amountUsd: '0',
                token: {
                    name: 'Ether',
                    symbol: 'ETH',
                    priceUsd: '0',
                } as IAsset['token'],
            });

            expect(assetUtils.normalizeAsset(asset).token.priceUsd).toEqual(
                '0',
            );
        });

        it('defaults a missing amount to zero', () => {
            const asset = buildAsset({ amount: undefined });

            expect(assetUtils.normalizeAsset(asset).amount).toEqual('0');
        });

        it.each(['', 'not-a-number'])(
            'defaults an invalid amount ("%s") to zero',
            (amount) => {
                const asset = buildAsset({ amount });

                expect(assetUtils.normalizeAsset(asset).amount).toEqual('0');
            },
        );

        // A number round-trip would turn these into 45129.41058500078 (dust left behind by a Max transfer),
        // 8.129158174664159 (more than the balance, so the transfer reverts) and 1e-9.
        it.each([
            '45129.410585000784913504',
            '8.129158174664158605',
            '0.000000001',
        ])('keeps the high-precision amount %s exactly', (amount) => {
            const asset = buildAsset({ amount });

            expect(assetUtils.normalizeAsset(asset).amount).toEqual(amount);
        });

        it('falls back to placeholders for an unnamed token', () => {
            const asset = buildAsset({
                token: {
                    name: '',
                    symbol: '',
                    priceUsd: '2',
                } as IAsset['token'],
            });
            const result = assetUtils.normalizeAsset(asset);

            expect(result.token.name).toEqual('Unknown');
            expect(result.token.symbol).toEqual('UNKNOWN');
        });

        it('preserves the extra fields of a workspace asset', () => {
            const asset = { ...buildAsset(), allocations: [], network: 'x' };

            expect(assetUtils.normalizeAsset(asset)).toMatchObject({
                allocations: [],
                network: 'x',
            });
        });
    });
});

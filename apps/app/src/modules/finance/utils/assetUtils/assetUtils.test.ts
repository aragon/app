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

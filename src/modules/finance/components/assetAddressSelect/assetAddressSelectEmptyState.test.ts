import { IconType } from '@aragon/gov-ui-kit';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { getAssetAddressSelectEmptyState } from './assetAddressSelectEmptyState';

describe('getAssetAddressSelectEmptyState', () => {
    const tMock: TranslationFunction = (key, options) =>
        options ? `${key}|${JSON.stringify(options)}` : key;

    it('returns heading interpolated with the searchValue', () => {
        const result = getAssetAddressSelectEmptyState({
            t: tMock,
            searchValue: 'stETH',
        });

        expect(result.heading).toContain(
            'app.finance.assetAddressSelect.emptyState.heading',
        );
        expect(result.heading).toContain('stETH');
    });

    it('returns a primary button with PLUS icon and onClick handler', () => {
        const onAddByAddressClick = jest.fn();
        const result = getAssetAddressSelectEmptyState({
            t: tMock,
            onAddByAddressClick,
        });

        expect(result.primaryButton.iconLeft).toBe(IconType.PLUS);
        expect(result.primaryButton.onClick).toBe(onAddByAddressClick);
        expect(result.primaryButton.label).toBe(
            'app.finance.assetAddressSelect.emptyState.addByAddress',
        );
    });
});

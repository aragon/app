import { IconType } from '@aragon/gov-ui-kit';
import type { TranslationFunction } from '@/shared/components/translationsProvider';

export interface IGetAssetAddressSelectEmptyStateParams {
    /**
     * Translation function from the `useTranslations` hook.
     */
    t: TranslationFunction;
    /**
     * Current search value used to build the heading (e.g. `No results for "stETH"`).
     */
    searchValue?: string;
    /**
     * Callback invoked when the user clicks the "Add by address" primary button.
     */
    onAddByAddressClick?: () => void;
}

export const getAssetAddressSelectEmptyState = (
    params: IGetAssetAddressSelectEmptyStateParams,
) => {
    const { t, searchValue, onAddByAddressClick } = params;

    return {
        heading: t('app.finance.assetAddressSelect.emptyState.heading', {
            search: searchValue ?? '',
        }),
        description: t('app.finance.assetAddressSelect.emptyState.description'),
        primaryButton: {
            label: t('app.finance.assetAddressSelect.emptyState.addByAddress'),
            iconLeft: IconType.PLUS,
            onClick: onAddByAddressClick,
        },
    };
};

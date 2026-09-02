import type { IAsset } from '../../api/financeService';

class AssetUtils {
    /**
     * Fills in the gaps of an asset returned by the backend so it can be rendered.
     *
     * The `amount` field can be missing, and `token.priceUsd` is 0 for tokens with no price feed. When the total USD
     * value is known the unit price is derived from it instead, and the token name and symbol fall back to
     * placeholders so unknown tokens are still identifiable in a list.
     * @param asset - Asset to normalize.
     * @returns The asset with a numeric amount, a best-effort unit price and a displayable token name and symbol.
     */
    normalizeAsset = <TAsset extends IAsset>(asset: TAsset): TAsset => {
        const amount = Number(asset.amount) || 0;
        const amountUsd = Number(asset.amountUsd) || 0;
        const originalPriceUsd = asset.token.priceUsd;
        const price = Number(originalPriceUsd) || 0;

        const derivedPrice =
            price === 0 && amount > 0 && amountUsd > 0
                ? amountUsd / amount
                : price;
        const priceUsd =
            derivedPrice !== price ? String(derivedPrice) : originalPriceUsd;

        return {
            ...asset,
            amount: String(amount),
            token: {
                ...asset.token,
                name: asset.token.name || 'Unknown',
                symbol: asset.token.symbol || 'UNKNOWN',
                priceUsd,
            },
        };
    };
}

export const assetUtils = new AssetUtils();

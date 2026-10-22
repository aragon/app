import type { IAsset } from '../../api/financeService';

class AssetUtils {
    /**
     * Normalises an asset for display: the backend may report a zero token price or an empty name/symbol, so the
     * price is derived from the amounts when possible and the labels fall back to placeholders.
     *
     * Shared by the DAO and the workspace asset lists, which read different endpoints — keeping the rule in one
     * place is what stops the same token showing a different price on each of them.
     * @param asset - Asset as returned by the backend.
     * @returns The asset with a displayable amount, price, name and symbol.
     */
    normalizeAsset = <TAsset extends IAsset>(asset: TAsset): TAsset => {
        const amount = Number(asset.amount) || 0;
        const amountUsd = Number(asset.amountUsd) || 0;
        const originalPriceUsd = asset.token.priceUsd;
        const price = Number(originalPriceUsd) || 0;

        // A priced token with a known value but no unit price: recover the unit price from the two amounts.
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

import type { IAsset } from '@/modules/finance/api/financeService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { AssetDataListItemStructure, ChainEntityType, useBlockExplorer } from '@aragon/gov-ui-kit';

export interface IAssetListItemProps {
    /**
     * Asset to be rendered.
     */
    asset: IAsset;
    /**
     * Callback called on asset click. Replaces the default link to the token block-explorer page when set.
     */
    onAssetClick?: (asset: IAsset) => void;
}

export const AssetListItem: React.FC<IAssetListItemProps> = (props) => {
    const { asset, onAssetClick } = props;
    const { token, amount } = asset;

    const { buildEntityUrl } = useBlockExplorer();

    const { chainId } = networkDefinitions[token.network];
    const entityUrl = buildEntityUrl({ type: ChainEntityType.TOKEN, id: token.address, chainId });

    const processedEntityUrl = onAssetClick != null ? undefined : entityUrl;
    const processedTarget = onAssetClick != null ? undefined : '_blank';

    const currentPrice = Number(token.priceUsd);
    const priceChangeOnDay = Number(token.priceChangeOnDayUsd);
    const historicalPrice = currentPrice - priceChangeOnDay;
    
    const priceChange = historicalPrice > 0 ? (priceChangeOnDay / historicalPrice) * 100 : 0;

    return (
        <AssetDataListItemStructure
            key={token.address}
            name={token.name}
            symbol={token.symbol}
            amount={amount}
            fiatPrice={token.priceUsd}
            logoSrc={token.logo}
            priceChange={priceChange}
            target={processedTarget}
            onClick={() => onAssetClick?.(asset)}
            href={processedEntityUrl}
        />
    );
};

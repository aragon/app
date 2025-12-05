import type { IAsset } from '@/modules/finance/api/financeService';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { AssetDataListItemStructure, ChainEntityType } from '@aragon/gov-ui-kit';

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

    const { buildEntityUrl } = useDaoChain({ network: token.network });

    const entityUrl = buildEntityUrl({ type: ChainEntityType.TOKEN, id: token.address });

    const processedEntityUrl = onAssetClick != null ? undefined : entityUrl;
    const processedTarget = onAssetClick != null ? undefined : '_blank';

    const hasPrice = Number(token.priceUsd) > 0;
    const fiatPrice = hasPrice ? token.priceUsd : '0';

    return (
        <AssetDataListItemStructure
            key={token.address}
            name={token.name || 'Unknown'}
            symbol={token.symbol || 'UNKNOWN'}
            amount={amount ?? '0'}
            fiatPrice={fiatPrice}
            logoSrc={token.logo}
            hideValue={false}
            target={processedTarget}
            onClick={() => onAssetClick?.(asset)}
            href={processedEntityUrl}
        />
    );
};

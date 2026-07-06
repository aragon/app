'use client';

import {
    AssetDataListItem,
    addressUtils,
    CardEmptyState,
    DataListFilter,
    DataListRoot,
} from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { Hex } from 'viem';
import type { IAsset } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useToken } from '@/shared/hooks/useToken';
import { useDaoChain } from '../../../../shared/hooks/useDaoChain';
import { AssetAddressSelectBackButton } from './assetAddressSelectBackButton';
import { AssetAddressSelectItem } from './assetAddressSelectItem';

export interface IAssetAddressSelectAddAddressViewProps {
    /**
     * Network used to resolve the pasted address against.
     */
    network: Network;
    /**
     * Optional address used to pre-fill the input — typically forwarded from the main search bar
     * when the user pasted an address that didn't match anything in the list. When set, `useToken`
     * is enabled on first render and the row resolves immediately.
     */
    initialAddress?: Hex;
    /**
     * Callback fired when the user clicks the back button.
     */
    onBack: () => void;
    /**
     * Callback fired when the user selects the resolved row. Receives an `IAsset` built from the
     * on-chain ERC20 reads. Name and symbol fall back to `Unknown`/`UNKNOWN` when empty; the row
     * is only selectable when `decimals` is available, since downstream `parseUnits` calls depend
     * on it.
     */
    onAssetClick?: (asset: IAsset) => void;
}

/**
 * Sub-screen rendered inside `AssetAddressSelect` when the user opts to add an asset by address.
 * Resolves the pasted address against the ERC20 interface and only surfaces a selectable row when
 * the contract responds with token data (specifically `decimals`). Addresses that don't resolve as
 * ERC20 render a "not a recognized token" empty state instead of a selectable row with guessed
 * defaults.
 */
export const AssetAddressSelectAddAddressView: React.FC<
    IAssetAddressSelectAddAddressViewProps
> = (props) => {
    const { network, initialAddress, onBack, onAssetClick } = props;

    const { t } = useTranslations();
    const { chainId } = useDaoChain({ network });

    const [searchValue, setSearchValue] = useState<string | undefined>(
        initialAddress,
    );

    const resolvedAddress: Hex | undefined =
        searchValue != null && addressUtils.isAddress(searchValue)
            ? (searchValue as Hex)
            : undefined;

    const { data: tokenData, isLoading } = useToken({
        address: resolvedAddress,
        chainId,
    });

    const asset: IAsset | undefined =
        resolvedAddress != null && tokenData != null
            ? {
                  amount: '0',
                  token: {
                      address: resolvedAddress,
                      network,
                      name: tokenData.name || 'Unknown',
                      symbol: tokenData.symbol || 'UNKNOWN',
                      decimals: tokenData.decimals,
                      logo: '',
                      priceUsd: '0',
                      totalSupply: tokenData.totalSupply,
                  },
              }
            : undefined;

    const showSkeleton = resolvedAddress != null && isLoading;
    const showResult = asset != null && !isLoading;
    const showInvalidToken =
        resolvedAddress != null && !isLoading && tokenData == null;

    return (
        <DataListRoot
            className="flex w-full flex-col gap-3"
            entityLabel={t('app.finance.assetAddressSelect.entity')}
            state={showSkeleton ? 'loading' : 'idle'}
        >
            <DataListFilter
                onSearchValueChange={setSearchValue}
                placeholder={t(
                    'app.finance.assetAddressSelect.addAddressView.placeholder',
                )}
                searchValue={searchValue}
            />
            <AssetAddressSelectBackButton onClick={onBack} />
            {showSkeleton && <AssetDataListItem.Skeleton />}
            {showResult && (
                <AssetAddressSelectItem
                    asset={asset}
                    onAssetClick={onAssetClick}
                />
            )}
            {showInvalidToken && (
                <CardEmptyState
                    description={t(
                        'app.finance.assetAddressSelect.addAddressView.notATokenState.description',
                    )}
                    heading={t(
                        'app.finance.assetAddressSelect.addAddressView.notATokenState.heading',
                    )}
                    isStacked={false}
                    objectIllustration={{ object: 'NOT_FOUND' }}
                />
            )}
        </DataListRoot>
    );
};

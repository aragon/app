import { formatUnits, zeroAddress } from 'viem';
import type { IAsset } from '@/modules/finance/api/financeService';
import { type ISafeBalance, useSafeBalances } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type INetworkDefinition,
    networkDefinitions,
} from '@/shared/constants/networkDefinitions';
import { dataListUtils } from '@/shared/utils/dataListUtils';
import type { ISafeAssetListSource } from '../../types';
import { assetUtils } from '../../utils/assetUtils';

/**
 * Converts a balance of the Safe transaction service into an asset. The service reports the native currency with a
 * null token and no price, so the chain definition names it and the zero address identifies it, as on DAO assets.
 */
const balanceToAsset = (
    balance: ISafeBalance,
    network: ISafeAssetListSource['network'],
    nativeCurrency: INetworkDefinition['nativeCurrency'],
): IAsset => {
    const { token, tokenAddress } = balance;
    const decimals = token?.decimals ?? nativeCurrency.decimals;

    return assetUtils.normalizeAsset({
        amount: formatUnits(BigInt(balance.balance), decimals),
        token: {
            address: tokenAddress ?? zeroAddress,
            network,
            name: token?.name ?? nativeCurrency.name,
            symbol: token?.symbol ?? nativeCurrency.symbol,
            decimals,
            logo: token?.logoUri ?? '',
            priceUsd: '0',
            // Not reported by the Safe transaction service.
            totalSupply: null,
        },
    });
};

// TODO(APP-1514): read the Safe's assets from the workspace assets API once it covers every Safe. The Safe transaction
// service reports no prices, so every asset shows $0.00 in the picker and the amount field until then.
/**
 * Asset list of a Safe, read from its balances on the Safe transaction service, in the shape `useAssetListData`
 * returns for a DAO. The service returns every balance at once, so there is a single page.
 */
export const useSafeAssetListData = (source: ISafeAssetListSource) => {
    const { network, address } = source;

    const { t } = useTranslations();
    const { nativeCurrency } = networkDefinitions[network];

    const { data, status, fetchStatus } = useSafeBalances({
        urlParams: { network, address },
    });

    const assetList = (data ?? []).map((balance) =>
        balanceToAsset(balance, network, nativeCurrency),
    );
    const state = dataListUtils.queryToDataListState({ status, fetchStatus });

    const errorState = {
        heading: t('app.finance.assetList.errorState.heading'),
        description: t('app.finance.assetList.errorState.description'),
    };

    const emptyState = {
        heading: t('app.finance.assetList.emptyState.heading'),
        description: t('app.finance.assetList.emptyState.description'),
    };

    return {
        onLoadMore: () => undefined,
        assetList,
        state,
        pageSize: assetList.length,
        itemsCount: assetList.length,
        emptyState,
        errorState,
    };
};

import { zeroAddress } from 'viem';
import type { IAsset } from '@/modules/finance/api/financeService';
import { safeBalanceUtils } from '@/modules/safe/utils/safeBalanceUtils';
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
 * Converts a balance of the Safe transaction service into an asset, sharing the balance conversion of the Safe
 * balance list. The native currency has no token address, so the zero address identifies it, as on DAO assets.
 */
const balanceToAsset = (
    balance: ISafeBalance,
    network: ISafeAssetListSource['network'],
    nativeCurrency: INetworkDefinition['nativeCurrency'],
): IAsset => {
    const { name, symbol, amount, decimals, logoSrc, tokenAddress } =
        safeBalanceUtils.getBalanceAsset({ balance, nativeCurrency });

    return assetUtils.normalizeAsset({
        amount,
        token: {
            address: tokenAddress ?? zeroAddress,
            network,
            name,
            symbol,
            decimals,
            logo: logoSrc ?? '',
            // Not reported by the Safe transaction service.
            priceUsd: '0',
            totalSupply: null,
        },
    });
};

/**
 * Page size of the Safe asset list, the backend default the DAO asset list gets. Fixed rather than the number of
 * balances: the list renders one loading skeleton per page item, and pages the loaded balances on its own.
 */
const safeAssetListPageSize = 10;

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
        pageSize: safeAssetListPageSize,
        itemsCount: assetList.length,
        emptyState,
        errorState,
    };
};

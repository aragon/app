import { formatUnits } from 'viem';
import type { ISafeBalance } from '@/shared/api/safeService';
import type { INetworkDefinition } from '@/shared/constants/networkDefinitions';

export interface ISafeBalanceAsset {
    /**
     * Name of the asset.
     */
    name: string;
    /**
     * Symbol of the asset.
     */
    symbol: string;
    /**
     * Balance converted from the smallest unit into a human-readable amount.
     */
    amount: string;
    /**
     * Logo of the asset, when known.
     */
    logoSrc?: string;
    /**
     * Address of the token, or undefined for the native currency of the chain.
     */
    tokenAddress?: string;
}

export interface IGetBalanceAssetParams {
    /**
     * Balance entry returned by the Safe transaction service.
     */
    balance: ISafeBalance;
    /**
     * Native currency of the chain the Safe is deployed on.
     */
    nativeCurrency: INetworkDefinition['nativeCurrency'];
}

class SafeBalanceUtils {
    /**
     * Resolves the display metadata of a Safe balance. The transaction service reports the native
     * currency with a null token, so the chain definition is the only source for its name, symbol
     * and decimals.
     */
    getBalanceAsset = (params: IGetBalanceAssetParams): ISafeBalanceAsset => {
        const { balance, nativeCurrency } = params;
        const { token, tokenAddress } = balance;

        const decimals = token?.decimals ?? nativeCurrency.decimals;

        return {
            name: token?.name ?? nativeCurrency.name,
            symbol: token?.symbol ?? nativeCurrency.symbol,
            amount: formatUnits(BigInt(balance.balance), decimals),
            logoSrc: token?.logoUri ?? undefined,
            tokenAddress: tokenAddress ?? undefined,
        };
    };
}

export const safeBalanceUtils = new SafeBalanceUtils();

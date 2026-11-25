import { renderHook } from '@testing-library/react';
import { zeroAddress } from 'viem';
import { Network } from '@/shared/api/daoService';
import * as safeService from '@/shared/api/safeService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    generateReactQueryResultError,
    generateReactQueryResultLoading,
    generateReactQueryResultSuccess,
    generateSafeBalance,
} from '@/shared/testUtils';
import { useSafeAssetListData } from './useSafeAssetListData';

describe('useSafeAssetListData hook', () => {
    const useSafeBalancesSpy = jest.spyOn(safeService, 'useSafeBalances');

    const network = Network.ETHEREUM_SEPOLIA;
    const address = '0x3333333333333333333333333333333333333333';

    afterEach(() => {
        useSafeBalancesSpy.mockReset();
    });

    it('reads the balances of the Safe and returns them as one page of assets', () => {
        const tokenAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
        useSafeBalancesSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: [
                    generateSafeBalance({ balance: '1500000000000000000' }),
                    generateSafeBalance({
                        tokenAddress,
                        token: {
                            name: 'USD Coin',
                            symbol: 'USDC',
                            decimals: 6,
                            logoUri: 'https://logo.png',
                        },
                        balance: '2500000',
                    }),
                ],
            }),
        );

        const { result } = renderHook(() =>
            useSafeAssetListData({ network, address }),
        );

        expect(useSafeBalancesSpy).toHaveBeenCalledWith({
            urlParams: { network, address },
        });
        expect(result.current.assetList).toEqual([
            {
                amount: '1.5',
                token: expect.objectContaining({
                    address: zeroAddress,
                    network,
                    symbol: networkDefinitions[network].nativeCurrency.symbol,
                    decimals: 18,
                    logo: '',
                    priceUsd: '0',
                }),
            },
            {
                amount: '2.5',
                token: expect.objectContaining({
                    address: tokenAddress,
                    network,
                    name: 'USD Coin',
                    symbol: 'USDC',
                    decimals: 6,
                    logo: 'https://logo.png',
                }),
            },
        ]);
        expect(result.current.itemsCount).toEqual(2);
        expect(result.current.pageSize).toEqual(2);
        expect(result.current.state).toEqual('idle');
    });

    it('returns the initial loading state while the balances load', () => {
        useSafeBalancesSpy.mockReturnValue(
            generateReactQueryResultLoading() as ReturnType<
                typeof safeService.useSafeBalances
            >,
        );

        const { result } = renderHook(() =>
            useSafeAssetListData({ network, address }),
        );

        expect(result.current.assetList).toEqual([]);
        expect(result.current.state).toEqual('initialLoading');
    });

    it('returns the error state when the balances cannot be read', () => {
        useSafeBalancesSpy.mockReturnValue(
            generateReactQueryResultError({ error: new Error('error') }),
        );

        const { result } = renderHook(() =>
            useSafeAssetListData({ network, address }),
        );

        expect(result.current.state).toEqual('error');
    });
});

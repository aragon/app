import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateSafeBalance, ReactQueryWrapper } from '@/shared/testUtils';
import { safeService } from '../../safeService';
import { useSafeBalances } from './useSafeBalances';

describe('useSafeBalances query', () => {
    const getSafeBalancesSpy = jest.spyOn(safeService, 'getSafeBalances');

    afterEach(() => {
        getSafeBalancesSpy.mockReset();
    });

    it('fetches the balances of the specified Safe', async () => {
        const params = {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                address: '0xSafeAddress',
            },
        };
        const balances = [generateSafeBalance({ balance: '42' })];
        getSafeBalancesSpy.mockResolvedValue(balances);

        const { result } = renderHook(() => useSafeBalances(params), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() => expect(result.current.data).toEqual(balances));
        expect(getSafeBalancesSpy).toHaveBeenCalledWith(params);
    });
});

import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateSafeBalance, ReactQueryWrapper } from '@/shared/testUtils';
import { safeTransactionService } from '../../safeTransactionService';
import { useSafeBalances } from './useSafeBalances';

describe('useSafeBalances query', () => {
    const getSafeBalancesSpy = jest.spyOn(
        safeTransactionService,
        'getSafeBalances',
    );

    afterEach(() => {
        getSafeBalancesSpy.mockReset();
    });

    it('fetches the balances of the specified Safe', async () => {
        const params = {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                address: '0xd84C233A7D1578021d21E39785439bEdDB165F3D',
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

import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateSafeTransaction, ReactQueryWrapper } from '@/shared/testUtils';
import { safeService } from '../../safeService';
import { useSafePendingTransactions } from './useSafePendingTransactions';

describe('useSafePendingTransactions query', () => {
    const getSafePendingTransactionsSpy = jest.spyOn(
        safeService,
        'getSafePendingTransactions',
    );

    afterEach(() => {
        getSafePendingTransactionsSpy.mockReset();
    });

    it('fetches the live queue of the specified safe from its current nonce', async () => {
        const params = {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                address: '0xd84C233A7D1578021d21E39785439bEdDB165F3D',
            },
            queryParams: { currentNonce: '12' },
        };
        const transactions = {
            count: 1,
            next: null,
            previous: null,
            results: [generateSafeTransaction({ nonce: '12' })],
        };
        getSafePendingTransactionsSpy.mockResolvedValue(transactions);

        const { result } = renderHook(
            () => useSafePendingTransactions(params),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() => expect(result.current.data).toEqual(transactions));
        expect(getSafePendingTransactionsSpy).toHaveBeenCalledWith(params);
    });
});

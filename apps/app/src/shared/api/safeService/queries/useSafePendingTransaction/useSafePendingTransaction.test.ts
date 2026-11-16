import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateSafeTransaction, ReactQueryWrapper } from '@/shared/testUtils';
import { safeService } from '../../safeService';
import { useSafePendingTransaction } from './useSafePendingTransaction';

describe('useSafePendingTransaction query', () => {
    const getSafePendingTransactionSpy = jest.spyOn(
        safeService,
        'getSafePendingTransaction',
    );

    afterEach(() => {
        getSafePendingTransactionSpy.mockReset();
    });

    it('fetches the queued transaction of the specified safe', async () => {
        const params = {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                address: '0xd84C233A7D1578021d21E39785439bEdDB165F3D',
                safeTxHash: '0xabc',
            },
            queryParams: { limit: 100 },
        };
        const transaction = generateSafeTransaction({ safeTxHash: '0xabc' });
        getSafePendingTransactionSpy.mockResolvedValue(transaction);

        const { result } = renderHook(() => useSafePendingTransaction(params), {
            wrapper: ReactQueryWrapper,
        });

        await waitFor(() => expect(result.current.data).toEqual(transaction));
        expect(getSafePendingTransactionSpy).toHaveBeenCalledWith(params);
    });
});

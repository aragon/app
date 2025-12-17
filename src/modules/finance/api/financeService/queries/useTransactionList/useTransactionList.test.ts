import { renderHook, waitFor } from '@testing-library/react';
import { generateTransaction } from '@/modules/finance/testUtils';
import { generatePaginatedResponse, ReactQueryWrapper } from '@/shared/testUtils';
import { financeService } from '../../financeService';
import { useTransactionList } from './useTransactionList';

describe('useTransactionList query', () => {
    const financeServiceSpy = jest.spyOn(financeService, 'getTransactionList');

    afterEach(() => {
        financeServiceSpy.mockReset();
    });

    it('fetches the transactions for the specified DAO', async () => {
        const params = { daoId: 'polygon-mainnet-0x123' };
        const transactionsResult = generatePaginatedResponse({
            data: [generateTransaction()],
        });
        financeServiceSpy.mockResolvedValue(transactionsResult);
        const { result } = renderHook(() => useTransactionList({ queryParams: params }), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(transactionsResult));
    });
});

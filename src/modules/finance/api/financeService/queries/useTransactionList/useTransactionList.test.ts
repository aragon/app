import { generateTransaction } from '@/modules/finance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper, generatePaginatedResponse } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { financeService } from '../../financeService';
import { useTransactionList } from './useTransactionList';

describe('useTransactionList query', () => {
    const financeServiceSpy = jest.spyOn(financeService, 'getTransactionList');

    afterEach(() => {
        financeServiceSpy.mockReset();
    });

    it('fetches the transactions for the specified address and network', async () => {
        const params = { address: '0x123', network: Network.POLYGON_MAINNET };
        const transactionsResult = generatePaginatedResponse({ data: [generateTransaction()] });
        financeServiceSpy.mockResolvedValue(transactionsResult);
        const { result } = renderHook(() => useTransactionList({ queryParams: params }), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(transactionsResult));
    });
});

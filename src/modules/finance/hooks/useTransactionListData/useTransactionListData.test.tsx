import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultLoading,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as financeService from '../../api/financeService';

import { generateTransaction } from '@/modules/finance/testUtils';
import { useTransactionListData } from './useTransactionListData';

jest.mock('../../api/financeService', () => ({
    __esModule: true,
    ...jest.requireActual('../../api/financeService'),
}));

describe('useTransactionListData hook', () => {
    const useTransactionListSpy = jest.spyOn(financeService, 'useTransactionList');

    afterEach(() => {
        useTransactionListSpy.mockReset();
    });

    it('fetches and returns the data needed to display the transaction list', () => {
        const transactions = [generateTransaction({ id: '0' })];
        const transactionsMetadata = generatePaginatedResponseMetadata({
            pageSize: 20,
            totalRecords: transactions.length,
        });
        const transactionsResponse = generatePaginatedResponse({ data: transactions, metadata: transactionsMetadata });
        const params = { queryParams: { address: 'dao-test', network: 'polygon-mainnet' } };
        useTransactionListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [transactionsResponse], pageParams: [] } }),
        );
        const { result } = renderHook(() => useTransactionListData(params));

        expect(useTransactionListSpy).toHaveBeenCalledWith(params);
        expect(result.current.transactionList).toEqual(transactions);
        expect(result.current.onLoadMore).toBeDefined();
        expect(result.current.pageSize).toEqual(transactionsMetadata.pageSize);
        expect(result.current.itemsCount).toEqual(transactions.length);
        expect(result.current.emptyState).toBeDefined();
        expect(result.current.errorState).toBeDefined();
        expect(result.current.state).toEqual('idle');
    });

    it('returns error state of fetch transactions error', () => {
        useTransactionListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error('error') }));
        const { result } = renderHook(() => useTransactionListData({ queryParams: { address: '' } }));
        expect(result.current.state).toEqual('error');
    });

    it('returns the pageSize set as hook parameter when data is loading', () => {
        useTransactionListSpy.mockReturnValue(generateReactQueryInfiniteResultLoading());
        const pageSize = 2;
        const { result } = renderHook(() => useTransactionListData({ queryParams: { pageSize } }));
        expect(result.current.pageSize).toEqual(pageSize);
    });
});

import { useTransactionList } from '@/modules/finance/api/financeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { useTransactionListData } from './useTransactionListData';

jest.mock('@/modules/finance/api/financeService');
jest.mock('@/shared/components/translationsProvider');

const mockUseTransactionList = useTransactionList as jest.Mock;
const mockUseTranslations = useTranslations as jest.Mock;

const createWrapper = () => {
    const queryClient = new QueryClient();
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = 'QueryClientWrapper';
    return Wrapper;
};

describe('useTransactionListData', () => {
    beforeEach(() => {
        mockUseTranslations.mockReturnValue({
            t: (key: string) => key,
        });
    });

    test('should return initial state correctly', () => {
        mockUseTransactionList.mockReturnValue({
            data: null,
            status: 'pending',
            fetchStatus: 'fetching',
            isFetchingNextPage: false,
            fetchNextPage: jest.fn(),
        });

        const { result } = renderHook(() => useTransactionListData({ queryParams: {} }), {
            wrapper: createWrapper(),
        });

        expect(result.current.transactionList).toBeUndefined();
        expect(result.current.state).toBe('initialLoading');
        expect(result.current.pageSize).toBeUndefined();
        expect(result.current.itemsCount).toBeUndefined();
    });

    test('should return data correctly when transaction list is fetched', () => {
        const transactionListData = {
            pages: [
                {
                    data: [{ id: 1, name: 'Transaction 1' }],
                    metadata: {
                        pageSize: 10,
                        totalRecords: 1,
                    },
                },
            ],
        };

        mockUseTransactionList.mockReturnValue({
            data: transactionListData,
            status: 'success',
            fetchStatus: 'idle',
            isFetchingNextPage: false,
            fetchNextPage: jest.fn(),
        });

        const { result } = renderHook(() => useTransactionListData({ queryParams: {} }), {
            wrapper: createWrapper(),
        });

        expect(result.current.transactionList).toEqual([{ id: 1, name: 'Transaction 1' }]);
        expect(result.current.state).toBe('idle'); // assuming idle due to fetchStatus being idle and no filters
        expect(result.current.pageSize).toBe(10);
        expect(result.current.itemsCount).toBe(1);
    });

    test('should call fetchNextPage when onLoadMore is called', () => {
        const fetchNextPageMock = jest.fn();

        mockUseTransactionList.mockReturnValue({
            data: null,
            status: 'success',
            fetchStatus: 'idle',
            isFetchingNextPage: false,
            fetchNextPage: fetchNextPageMock,
        });

        const { result } = renderHook(() => useTransactionListData({ queryParams: {} }), {
            wrapper: createWrapper(),
        });

        act(() => {
            result.current.onLoadMore();
        });

        expect(fetchNextPageMock).toHaveBeenCalled();
    });
});

import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as financeService from '../../api/financeService';

import { TransactionType } from '@/modules/finance/api/financeService/domain/enum';
import { generateTransaction } from '@/modules/finance/testUtils';
import { Network } from '@/shared/api/daoService';
import { useTransactionListData } from './useTransactionListData';

// Needed to spy usage of useTransactionList hook
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
        const transactions = [
            generateTransaction({
                network: Network.ETHEREUM_MAINNET,
                blockNumber: 0,
                blockTimestamp: Date.now(),
                fromAddress: '0x0000000000000000000000000000000000000000',
                toAddress: '0x0000000000000000000000000000000000000000',
                token: {
                    address: '0xec10f0f223e52f2d939c7372b62ef2f55173282f',
                    network: 'ethereum-mainnet',
                    symbol: 'ETH',
                    logo: 'https://test.com',
                    name: 'Ethereum',
                    type: '',
                    decimals: 0,
                    priceChangeOnDayUsd: '0.00',
                    priceUsd: '0.00',
                },
                value: '0',
                type: TransactionType.DEPOSIT,
                transactionHash: '0x0000000000000000000000000000000000000000',
                id: '0',
                category: 'external',
                tokenAddress: '0x0000000000000000000000000000000000000000',
                daoAddress: '0x0000000000000000000000000000000000000000',
            }),
        ];
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
});

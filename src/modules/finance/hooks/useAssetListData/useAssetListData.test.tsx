import { useAssetListData } from '@/modules/finance/hooks/useAssetListData';
import { generateAsset, generateToken } from '@/modules/finance/testUtils';
import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultLoading,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as financeService from '../../api/financeService';

jest.mock('../../api/financeService', () => ({
    __esModule: true,
    ...jest.requireActual('../../api/financeService'),
}));

describe('useAssetListData hook', () => {
    const useAssetListSpy = jest.spyOn(financeService, 'useAssetList');

    afterEach(() => {
        useAssetListSpy.mockReset();
    });

    it('fetches and returns the data needed to display the asset list', () => {
        const balances = [generateAsset({ token: generateToken(), amount: '1000' })];
        const balancesMetadata = generatePaginatedResponseMetadata({
            pageSize: 20,
            totalRecords: balances.length,
        });
        const assetsResponse = generatePaginatedResponse({ data: balances, metadata: balancesMetadata });
        const params = { queryParams: { daoAddress: 'dao-test', network: 'polygon-mainnet' } };
        useAssetListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [assetsResponse], pageParams: [] } }),
        );
        const { result } = renderHook(() => useAssetListData(params));

        expect(useAssetListSpy).toHaveBeenCalledWith(params);
        expect(result.current.assetList).toEqual(balances);
        expect(result.current.onLoadMore).toBeDefined();
        expect(result.current.pageSize).toEqual(balancesMetadata.pageSize);
        expect(result.current.itemsCount).toEqual(balances.length);
        expect(result.current.emptyState).toBeDefined();
        expect(result.current.errorState).toBeDefined();
        expect(result.current.state).toEqual('idle');
    });

    it('returns error state if fetching assets fails', () => {
        useAssetListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error('error') }));
        const { result } = renderHook(() => useAssetListData({ queryParams: { address: '' } }));
        expect(result.current.state).toEqual('error');
    });

    it('returns the pageSize set as hook parameter when data is loading', () => {
        useAssetListSpy.mockReturnValue(generateReactQueryInfiniteResultLoading());
        const pageSize = 2;
        const { result } = renderHook(() => useAssetListData({ queryParams: { pageSize } }));

        expect(result.current.pageSize).toEqual(pageSize);
    });
});

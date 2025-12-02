import { generateAsset } from '@/modules/finance/testUtils';
import { ReactQueryWrapper, generatePaginatedResponse } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { financeService } from '../../financeService';
import { useAssetList } from './useAssetList';

describe('useAssetList query', () => {
    const financeServiceSpy = jest.spyOn(financeService, 'getAssetList');

    afterEach(() => {
        financeServiceSpy.mockReset();
    });

    it('fetches the assets for the specified DAO', async () => {
        const params = { daoId: 'eth-sepolia-0xdao' };
        const assetsResult = generatePaginatedResponse({ data: [generateAsset()] });
        financeServiceSpy.mockResolvedValue(assetsResult);
        const { result } = renderHook(() => useAssetList({ queryParams: params }), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(assetsResult));
    });
});

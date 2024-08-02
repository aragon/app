import { ReactQueryWrapper, generateDao, generatePaginatedResponse } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { daoExplorerService } from '../../daoExplorerService';
import { useDaoList } from './useDaoList';

describe('useDaoList query', () => {
    const daoExplorerServiceSpy = jest.spyOn(daoExplorerService, 'getDaoList');

    afterEach(() => {
        daoExplorerServiceSpy.mockReset();
    });

    it('fetches a list of DAOs', async () => {
        const params = {};
        const daosResult = generatePaginatedResponse({ data: [generateDao()] });
        daoExplorerServiceSpy.mockResolvedValue(daosResult);
        const { result } = renderHook(() => useDaoList({ queryParams: params }), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(daosResult));
    });
});

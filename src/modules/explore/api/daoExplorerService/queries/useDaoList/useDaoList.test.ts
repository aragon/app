import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { generateDao, generatePaginatedResponse, ReactQueryWrapper } from '@/shared/testUtils';
import { daoExplorerService } from '../../daoExplorerService';
import { useDaoList } from './useDaoList';

describe('useDaoList query', () => {
    const daoExplorerServiceSpy = jest.spyOn(daoExplorerService, 'getDaoList');

    afterEach(() => {
        daoExplorerServiceSpy.mockReset();
    });

    it('fetches a list of DAOs', async () => {
        const params = { networks: [Network.ETHEREUM_MAINNET] };
        const daosResult = generatePaginatedResponse({ data: [generateDao()] });
        daoExplorerServiceSpy.mockResolvedValue(daosResult);
        const { result } = renderHook(() => useDaoList({ queryParams: params }), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(daosResult));
    });
});

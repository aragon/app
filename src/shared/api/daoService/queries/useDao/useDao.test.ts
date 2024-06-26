import { ReactQueryWrapper, generateDao } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { daoService } from '../../daoService';
import { useDao } from './useDao';

describe('useDao query', () => {
    const getDaoSpy = jest.spyOn(daoService, 'getDao');

    afterEach(() => {
        getDaoSpy.mockReset();
    });

    it('fetches the specified DAO', async () => {
        const params = { id: 'test' };
        const dao = generateDao();
        getDaoSpy.mockResolvedValue(dao);
        const { result } = renderHook(() => useDao({ urlParams: params }), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data).toEqual(dao));
    });
});

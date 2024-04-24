import { ReactQueryWrapper, generateDao } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { daoService } from '../../daoService';
import { useDao } from './useDao';

describe('useDao query', () => {
    const daoServiceSpy = jest.spyOn(daoService, 'getDao');

    afterEach(() => {
        daoServiceSpy.mockReset();
    });

    it('fetches the specified DAO', async () => {
        const params = { slug: 'test' };
        const dao = generateDao();
        daoServiceSpy.mockResolvedValue(dao);
        const { result } = renderHook(() => useDao({ urlParams: params }), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data).toEqual(dao));
    });
});

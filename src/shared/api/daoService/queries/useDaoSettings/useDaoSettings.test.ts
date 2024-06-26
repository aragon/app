import { ReactQueryWrapper, generateDaoSettings } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { daoService } from '../../daoService';
import { useDaoSettings } from './useDaoSettings';

describe('useDaoSettings query', () => {
    const getDaoSettingsSpy = jest.spyOn(daoService, 'getDaoSettings');

    afterEach(() => {
        getDaoSettingsSpy.mockReset();
    });

    it('fetches the specified DAO settings', async () => {
        const params = { daoId: 'test' };
        const settings = generateDaoSettings();
        getDaoSettingsSpy.mockResolvedValue(settings);
        const { result } = renderHook(() => useDaoSettings({ urlParams: params }), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data).toEqual(settings));
    });
});

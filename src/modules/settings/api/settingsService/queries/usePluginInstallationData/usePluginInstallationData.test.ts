import { ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { settingsService } from '../../settingsService';
import { usePluginInstallationData } from './usePluginInstallationData';

describe('usePluginInstallationData query', () => {
    const getPluginInstallationDataSpy = jest.spyOn(settingsService, 'getPluginInstallationData');

    afterEach(() => {
        getPluginInstallationDataSpy.mockReset();
    });

    it('fetches the installation data of the specified plugin', async () => {
        const params = { urlParams: { address: '0x123' } };
        const installationData = { helpers: ['0x456'] };
        getPluginInstallationDataSpy.mockResolvedValue(installationData);
        const { result } = renderHook(() => usePluginInstallationData(params), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data).toEqual(installationData));
    });
});

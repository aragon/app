import { Network } from '@/shared/api/daoService';
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
        const params = { queryParams: { pluginAddress: '0x123', network: Network.ZKSYNC_MAINNET } };
        const installationData = { preparedSetupData: { helpers: ['0x456'] } };
        getPluginInstallationDataSpy.mockResolvedValue(installationData);
        const { result } = renderHook(() => usePluginInstallationData(params), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data).toEqual(installationData));
    });
});

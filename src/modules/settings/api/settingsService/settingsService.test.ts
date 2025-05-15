import { Network } from '@/shared/api/daoService';
import { settingsService } from './settingsService';

describe('settings service', () => {
    const requestSpy = jest.spyOn(settingsService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getPluginInstallationData fetches the installation data of the plugin', async () => {
        const installationData = { preparedSetupData: { helpers: ['0x123', '0x456'] } };
        const params = { queryParams: { pluginAddress: '0x789', network: Network.BASE_MAINNET } };

        requestSpy.mockResolvedValue(installationData);
        const result = await settingsService.getPluginInstallationData(params);

        expect(requestSpy).toHaveBeenCalledWith(settingsService['urls'].pluginInstallationData, params);
        expect(result).toEqual(installationData);
    });
});

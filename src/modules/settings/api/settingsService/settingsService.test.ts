import { settingsService } from './settingsService';

describe('settings service', () => {
    const requestSpy = jest.spyOn(settingsService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getPluginInstallationData fetches the installation data of the plugin', async () => {
        const installationData = { helpers: ['0x123', '0x456'] };
        const params = { urlParams: { address: '0x789' } };

        requestSpy.mockResolvedValue(installationData);
        const result = await settingsService.getPluginInstallationData(params);

        expect(requestSpy).toHaveBeenCalledWith(settingsService['urls'].pluginInstallationData, params);
        expect(result).toEqual(installationData);
    });
});

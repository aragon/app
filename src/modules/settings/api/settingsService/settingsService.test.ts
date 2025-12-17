import type { Hex } from 'viem';
import { Network } from '@/shared/api/daoService';
import { EventLogPluginType, type IPluginEventLog } from './domain';
import { settingsService } from './settingsService';

describe('settings service', () => {
    const requestSpy = jest.spyOn(settingsService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getPluginInstallationData fetches the installation data of the plugin', async () => {
        const installationData = {
            preparedSetupData: { helpers: ['0x123', '0x456'] },
        };
        const params = {
            queryParams: {
                pluginAddress: '0x789',
                network: Network.BASE_MAINNET,
            },
        };

        requestSpy.mockResolvedValue(installationData);
        const result = await settingsService.getPluginInstallationData(params);

        expect(requestSpy).toHaveBeenCalledWith(settingsService.urls.pluginInstallationData, params);
        expect(result).toEqual(installationData);
    });

    it('getLastPluginEventLog fetches the last event tx log of the plugin for the specified event', async () => {
        const pluginLog: IPluginEventLog = {
            event: EventLogPluginType.INSTALLATION_PREPARED,
            pluginSetupRepo: '0xabc' as Hex,
            pluginAddress: '0x789' as Hex,
            permissions: [],
            build: '1',
            release: '1',
        };
        const params = {
            urlParams: {
                pluginAddress: '0x789',
                network: Network.BASE_MAINNET,
                event: EventLogPluginType.INSTALLATION_PREPARED,
            },
        };

        requestSpy.mockResolvedValue(pluginLog);
        const result = await settingsService.getLastPluginEventLog(params);

        expect(requestSpy).toHaveBeenCalledWith(settingsService.urls.lastPluginEventLog, params);
        expect(result).toEqual(pluginLog);
    });
});

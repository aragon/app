import { Network } from '@/shared/api/daoService';
import { IEventLogPluginType } from './domain';
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

    it('getPluginLogs fetches the logs of the plugin for the specified event', async () => {
        const pluginLogs = {
            logs: [
                {
                    id: '1',
                    event: IEventLogPluginType.InstallationPrepared,
                    transactionHash: '0xabc',
                    blockNumber: 12345,
                    timestamp: 1625097600,
                    data: { param1: 'value1' },
                },
            ],
        };
        const params = {
            urlParams: {
                pluginAddress: '0x789',
                network: Network.BASE_MAINNET,
                event: IEventLogPluginType.InstallationPrepared,
            },
        };

        requestSpy.mockResolvedValue(pluginLogs);
        const result = await settingsService.getPluginLogs(params);

        expect(requestSpy).toHaveBeenCalledWith(settingsService['urls'].pluginLogs, params);
        expect(result).toEqual(pluginLogs);
    });
});

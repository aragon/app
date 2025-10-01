import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { IEventLogPluginType } from '../../domain';
import { settingsService } from '../../settingsService';
import { usePluginLogs } from './usePluginLogs';

describe('usePluginLogs query', () => {
    const getPluginLogsSpy = jest.spyOn(settingsService, 'getPluginLogs');

    afterEach(() => {
        getPluginLogsSpy.mockReset();
    });

    it('fetches the logs of the specified plugin for the given event', async () => {
        const params = {
            urlParams: {
                pluginAddress: '0x123',
                network: Network.ZKSYNC_MAINNET,
                event: IEventLogPluginType.InstallationPrepared,
            },
        };
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
        getPluginLogsSpy.mockResolvedValue(pluginLogs);
        const { result } = renderHook(() => usePluginLogs(params), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data).toEqual(pluginLogs));
    });
});
import type { Hex } from 'viem';
import { Network } from '@/shared/api/daoService';
import { generatePaginatedResponse } from '@/shared/testUtils';
import { generateGauge } from '../../testUtils/generators';
import { gaugeVoterService } from './gaugeVoterService';

describe('gaugeVoter service', () => {
    const requestSpy = jest.spyOn(gaugeVoterService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getGaugeList fetches a paginated list of gauges for the provided plugin', async () => {
        const gaugesList = [
            generateGauge({ address: '0x1234567890123456789012345678901234567890' }),
            generateGauge({ address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' }),
        ];
        const gaugesListResponse = generatePaginatedResponse({
            data: gaugesList,
        });
        const params = {
            urlParams: {
                pluginAddress: '0x1234567890123456789012345678901234567890' as Hex,
                network: Network.BASE_MAINNET,
            },
            queryParams: {
                pageSize: 2,
            },
        };

        requestSpy.mockResolvedValue(gaugesListResponse);

        const result = await gaugeVoterService.getGaugeList(params);

        expect(requestSpy).toHaveBeenCalledWith('/v2/gauge/:pluginAddress/:network', params);
        expect(result).toEqual(gaugesListResponse);
    });
});

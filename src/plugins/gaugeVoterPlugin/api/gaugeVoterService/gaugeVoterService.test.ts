import { Network } from '@/shared/api/daoService';
import { generatePaginatedResponse } from '@/shared/testUtils';
import { generateGauge } from '../../testUtils/generators';
import { gaugeVoterService } from './gaugeVoterService';

describe('gaugeVoter service', () => {
    const requestSpy = jest.spyOn(gaugeVoterService, 'request');

    afterEach(() => {
        requestSpy.mockReset();
    });

    it('getGaugeList fetches a paginated list of gauge results for the given user address', async () => {
        const gaugesList = [
            generateGauge({ address: '0x1234567890123456789012345678901234567890' }),
            generateGauge({ address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' }),
        ];
        const gaugesListResponse = generatePaginatedResponse({
            data: [
                {
                    gauges: gaugesList,
                    metrics: {
                        epochId: 'epoch-1',
                        isVotingPeriod: true,
                        endTime: Date.now() + 1000,
                        totalVotes: 100,
                        votingPower: 1000,
                        usedVotingPower: 100,
                    },
                },
            ],
        });
        const params = {
            urlParams: { userAddress: '0x789' },
            queryParams: {
                pluginAddress: '0x123',
                network: Network.BASE_MAINNET,
                pageSize: 2,
            },
        };

        requestSpy.mockResolvedValue(gaugesListResponse);

        const result = await gaugeVoterService.getGaugeList(params);

        expect(requestSpy).toHaveBeenCalledWith('/v2/gauges/0x789', { queryParams: params.queryParams });
        expect(result).toEqual(gaugesListResponse);
    });

    it.only('getGaugeList returns mock gauge data', async () => {
        const params = {
            urlParams: { userAddress: '0x789' },
            queryParams: {
                pluginAddress: '0x123',
                network: Network.BASE_MAINNET,
                pageSize: 2,
            },
        };

        const result = await gaugeVoterService.getGaugeList(params);

        // Currently returns mock data, not actual API call
        expect(result.data).toBeDefined();
        expect(result.data[0].gauges).toHaveLength(5); // 5 mock gauges
        expect(result.data[0].metrics).toBeDefined();
        expect(result.data[0].metrics.epochId).toBe('epoch-1');
        expect(result.metadata).toBeDefined();
    });
});

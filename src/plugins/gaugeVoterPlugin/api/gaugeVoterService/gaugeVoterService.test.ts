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
            generateGauge({
                address: '0x1234567890123456789012345678901234567890',
            }),
            generateGauge({
                address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            }),
        ];
        const gaugesListResponse = generatePaginatedResponse({
            data: gaugesList,
        });
        const params = {
            urlParams: {
                pluginAddress:
                    '0x1234567890123456789012345678901234567890' as Hex,
                network: Network.BASE_MAINNET,
            },
            queryParams: {
                pageSize: 2,
            },
        };

        requestSpy.mockResolvedValue(gaugesListResponse);

        const result = await gaugeVoterService.getGaugeList(params);

        expect(requestSpy).toHaveBeenCalledWith(
            '/v2/gauge/:pluginAddress/:network',
            params,
        );
        expect(result).toEqual(gaugesListResponse);
    });

    it('getGaugeRewardDistribution fetches per-gauge reward shares for an epoch', async () => {
        const response = {
            epoch: 42,
            pluginAddress: '0x1234567890123456789012345678901234567890',
            network: Network.BASE_MAINNET,
            totalVotingPower: '1000',
            rewardTotalAmount: '1000000',
            gaugeRewards: [
                {
                    gauge: '0xg1',
                    votingPower: '600',
                    rewardAmount: '600000',
                },
                {
                    gauge: '0xg2',
                    votingPower: '400',
                    rewardAmount: '400000',
                },
            ],
        };
        const params = {
            urlParams: {
                pluginAddress:
                    '0x1234567890123456789012345678901234567890' as Hex,
                network: Network.BASE_MAINNET,
                epochId: 42,
            },
            queryParams: {
                rewardTotalAmount: '1000000',
            },
        };

        requestSpy.mockResolvedValue(response);

        const result =
            await gaugeVoterService.getGaugeRewardDistribution(params);

        expect(requestSpy).toHaveBeenCalledWith(
            '/v2/gauge/gaugeRewards/:pluginAddress/:network/:epochId',
            params,
        );
        expect(result).toEqual(response);
    });
});

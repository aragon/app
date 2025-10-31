import { Network } from '@/shared/api/daoService';
import { renderHook } from '@testing-library/react';
import { useEpochMetrics } from './useEpochMetrics';

// Mock the service
jest.mock('../../gaugeVoterService', () => ({
    gaugeVoterService: {
        getEpochMetrics: jest.fn(),
    },
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));

describe('useEpochMetrics hook', () => {
    it('should be defined', () => {
        const params = {
            urlParams: {
                pluginAddress: '0x456' as `0x${string}`,
                network: Network.ETHEREUM_MAINNET,
            },
            queryParams: {},
        };

        const { result } = renderHook(() => useEpochMetrics(params));
        expect(result).toBeDefined();
    });
});

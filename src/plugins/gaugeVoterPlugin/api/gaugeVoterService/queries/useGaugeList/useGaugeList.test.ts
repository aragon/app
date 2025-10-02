import { renderHook } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { useGaugeList } from './useGaugeList';

// Mock the service
jest.mock('../../gaugeVoterService', () => ({
    gaugeVoterService: {
        getGaugeList: jest.fn(),
        getNextPageParams: jest.fn(),
    },
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
    useInfiniteQuery: jest.fn(),
}));

describe('useGaugeList hook', () => {
    it('should be defined', () => {
        const params = {
            urlParams: {
                userAddress: '0x123',
            },
            queryParams: {
                pluginAddress: '0x456',
                network: Network.ETHEREUM_MAINNET,
            },
        };

        const { result } = renderHook(() => useGaugeList(params));
        expect(result).toBeDefined();
    });
});
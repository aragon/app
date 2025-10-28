import { Network } from '@/shared/api/daoService';
import { renderHook } from '@testing-library/react';
import type { Hex } from 'viem';
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
                pluginAddress: '0x4564564564564564564564564564564564564564' as Hex,
                network: Network.ETHEREUM_MAINNET,
            },
            queryParams: {},
        };

        const { result } = renderHook(() => useGaugeList(params));
        expect(result).toBeDefined();
    });
});

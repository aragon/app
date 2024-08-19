import * as useProposalListByMemberAddress from '@/shared/api/daoService/queries/useProposalListByMemberAddress';
import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultLoading,
    generateReactQueryInfiniteResultSuccess,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as governanceService from '../../api/governanceService';
import { generateProposal } from '../../testUtils';
import { useProposalListData } from './useProposalListData';

describe('useProposalListData hook', () => {
    const useProposalListSpy = jest.spyOn(governanceService, 'useProposalList');
    const useProposalListByMemberAddressSpy = jest.spyOn(
        useProposalListByMemberAddress,
        'useProposalListByMemberAddress',
    );

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('fetches and returns the data needed to display the proposal list with initialParams', () => {
        const proposals = [generateProposal()];
        const proposalsMetadata = generatePaginatedResponseMetadata({ pageSize: 20, totalRecords: proposals.length });
        const proposalsResponse = generatePaginatedResponse({ data: proposals, metadata: proposalsMetadata });
        const initialParams = { queryParams: { daoId: 'dao-test' } };
        const byMemberAddressParams = undefined;

        useProposalListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [proposalsResponse], pageParams: [] } }),
        );

        const { result } = renderHook(() => useProposalListData(initialParams, byMemberAddressParams), {
            wrapper: ReactQueryWrapper,
        });

        expect(useProposalListSpy).toHaveBeenCalledWith(initialParams, { enabled: true });
        expect(result.current.proposalList).toEqual(proposals);
        expect(result.current.onLoadMore).toBeDefined();
        expect(result.current.pageSize).toEqual(proposalsMetadata.pageSize);
        expect(result.current.itemsCount).toEqual(proposals.length);
        expect(result.current.emptyState).toBeDefined();
        expect(result.current.errorState).toBeDefined();
        expect(result.current.state).toEqual('idle');
    });

    it('fetches and returns the data for proposals by member address with byMemberAddressParams', () => {
        const proposals = [generateProposal()];
        const proposalsMetadata = generatePaginatedResponseMetadata({ pageSize: 20, totalRecords: proposals.length });
        const proposalsResponse = generatePaginatedResponse({ data: proposals, metadata: proposalsMetadata });
        const initialParams = undefined;
        const byMemberAddressParams = {
            queryParams: { daoId: 'dao-test', creatorAddress: '0x1234567890123456789012345678901234567890' },
        };

        useProposalListByMemberAddressSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [proposalsResponse], pageParams: [] } }),
        );

        const { result } = renderHook(() => useProposalListData(initialParams, byMemberAddressParams), {
            wrapper: ReactQueryWrapper,
        });

        expect(useProposalListByMemberAddressSpy).toHaveBeenCalledWith(byMemberAddressParams, { enabled: true });
        expect(result.current.proposalList).toEqual(proposals);
        expect(result.current.onLoadMore).toBeDefined();
        expect(result.current.pageSize).toEqual(proposalsMetadata.pageSize);
        expect(result.current.itemsCount).toEqual(proposals.length);
        expect(result.current.emptyState).toBeDefined();
        expect(result.current.errorState).toBeDefined();
        expect(result.current.state).toEqual('idle');
    });

    it('returns error state if fetching proposals fails', () => {
        useProposalListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error('error') }));

        const { result } = renderHook(() => useProposalListData({ queryParams: { daoId: '' } }), {
            wrapper: ReactQueryWrapper,
        });

        expect(result.current.state).toEqual('error');
    });

    it('returns the pageSize set as hook parameter when data is loading', () => {
        useProposalListSpy.mockReturnValue(generateReactQueryInfiniteResultLoading());

        const pageSize = 6;
        const { result } = renderHook(() => useProposalListData({ queryParams: { daoId: '', pageSize } }), {
            wrapper: ReactQueryWrapper,
        });

        expect(result.current.pageSize).toEqual(pageSize);
    });
});

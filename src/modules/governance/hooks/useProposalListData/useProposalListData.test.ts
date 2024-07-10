import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultLoading,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as governanceService from '../../api/governanceService';
import { generateProposal } from '../../testUtils';
import { useProposalListData } from './useProposalListData';

// Needed to spy usage of useProposalList hook
jest.mock('../../api/governanceService', () => ({
    __esModule: true,
    ...jest.requireActual('../../api/governanceService'),
}));

describe('useProposalListData hook', () => {
    const useProposalListSpy = jest.spyOn(governanceService, 'useProposalList');

    afterEach(() => {
        useProposalListSpy.mockReset();
    });

    it('fetches and returns the data needed to display the proposal list', () => {
        const proposals = [generateProposal({})];
        const proposalsMetadata = generatePaginatedResponseMetadata({ pageSize: 20, totalRecords: proposals.length });
        const proposalsResponse = generatePaginatedResponse({ data: proposals, metadata: proposalsMetadata });
        const params = { queryParams: { daoId: 'dao-test' } };
        useProposalListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [proposalsResponse], pageParams: [] } }),
        );
        const { result } = renderHook(() => useProposalListData(params));

        expect(useProposalListSpy).toHaveBeenCalledWith(params);
        expect(result.current.proposalList).toEqual(proposals);
        expect(result.current.onLoadMore).toBeDefined();
        expect(result.current.pageSize).toEqual(proposalsMetadata.pageSize);
        expect(result.current.itemsCount).toEqual(proposals.length);
        expect(result.current.emptyState).toBeDefined();
        expect(result.current.errorState).toBeDefined();
        expect(result.current.state).toEqual('idle');
    });

    it('returns error state of fetch proposals error', () => {
        useProposalListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error('error') }));
        const { result } = renderHook(() => useProposalListData({ queryParams: { daoId: '' } }));
        expect(result.current.state).toEqual('error');
    });

    it('returns the pageSize set as hook parameter when data is loading', () => {
        useProposalListSpy.mockReturnValue(generateReactQueryInfiniteResultLoading());
        const pageSize = 6;
        const { result } = renderHook(() => useProposalListData({ queryParams: { daoId: '', pageSize } }));
        expect(result.current.pageSize).toEqual(pageSize);
    });
});

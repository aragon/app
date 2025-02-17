import {
    generatePaginatedResponse,
    generatePaginatedResponseMetadata,
    generateReactQueryInfiniteResultError,
    generateReactQueryInfiniteResultLoading,
    generateReactQueryInfiniteResultSuccess,
} from '@/shared/testUtils';
import { renderHook } from '@testing-library/react';
import * as governanceService from '../../api/governanceService';
import { generateMember } from '../../testUtils';
import { useMemberListData } from './useMemberListData';

describe('useMemberListData hook', () => {
    const useMemberListSpy = jest.spyOn(governanceService, 'useMemberList');

    afterEach(() => {
        useMemberListSpy.mockReset();
    });

    it('fetches and returns the data needed to display the member list', () => {
        const members = [generateMember({ address: '0x123' })];
        const membersMetadata = generatePaginatedResponseMetadata({ pageSize: 20, totalRecords: members.length });
        const membersResponse = generatePaginatedResponse({ data: members, metadata: membersMetadata });
        const params = { queryParams: { daoId: 'dao-test', pluginAddress: '0x123' } };
        useMemberListSpy.mockReturnValue(
            generateReactQueryInfiniteResultSuccess({ data: { pages: [membersResponse], pageParams: [] } }),
        );
        const { result } = renderHook(() => useMemberListData(params));

        expect(useMemberListSpy).toHaveBeenCalledWith(params);
        expect(result.current.memberList).toEqual(members);
        expect(result.current.onLoadMore).toBeDefined();
        expect(result.current.pageSize).toEqual(membersMetadata.pageSize);
        expect(result.current.itemsCount).toEqual(members.length);
        expect(result.current.emptyState).toBeDefined();
        expect(result.current.errorState).toBeDefined();
        expect(result.current.state).toEqual('idle');
    });

    it('returns error state of fetch members error', () => {
        useMemberListSpy.mockReturnValue(generateReactQueryInfiniteResultError({ error: new Error('error') }));
        const { result } = renderHook(() => useMemberListData({ queryParams: { daoId: '', pluginAddress: '' } }));
        expect(result.current.state).toEqual('error');
    });

    it('returns the pageSize set as hook parameter when data is loading', () => {
        useMemberListSpy.mockReturnValue(generateReactQueryInfiniteResultLoading());
        const pageSize = 6;
        const { result } = renderHook(() =>
            useMemberListData({ queryParams: { daoId: '', pluginAddress: '', pageSize } }),
        );
        expect(result.current.pageSize).toEqual(pageSize);
    });
});

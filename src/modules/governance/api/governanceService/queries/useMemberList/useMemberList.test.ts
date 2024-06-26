import { generateMember } from '@/modules/governance/testUtils';
import { ReactQueryWrapper, generatePaginatedResponse } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { governanceService } from '../../governanceService';
import { useMemberList } from './useMemberList';

describe('useMemberList query', () => {
    const governanceServiceSpy = jest.spyOn(governanceService, 'getMemberList');

    afterEach(() => {
        governanceServiceSpy.mockReset();
    });

    it('fetches the members of the specified DAO', async () => {
        const params = { daoId: 'dao-id-test' };
        const membersResult = generatePaginatedResponse({ data: [generateMember()] });
        governanceServiceSpy.mockResolvedValue(membersResult);
        const { result } = renderHook(() => useMemberList({ queryParams: params }), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(membersResult));
    });
});

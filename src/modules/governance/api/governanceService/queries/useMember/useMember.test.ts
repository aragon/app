import { generateMember } from '@/modules/governance/testUtils';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { governanceService } from '../../governanceService';
import { useMember } from './useMember';

describe('useMember query', () => {
    const getMemberSpy = jest.spyOn(governanceService, 'getMember');

    afterEach(() => {
        getMemberSpy.mockReset();
    });

    it('fetches the specified member', async () => {
        const member = generateMember();
        getMemberSpy.mockResolvedValue(member);

        const urlParams = { address: member.address };
        const queryParams = { daoId: 'dao-id' };
        const { result } = renderHook(() => useMember({ urlParams, queryParams }), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data).toEqual(member));
    });
});

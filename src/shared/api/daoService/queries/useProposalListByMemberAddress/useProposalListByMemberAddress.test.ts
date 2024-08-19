import { generateProposal } from '@/modules/governance/testUtils';
import { daoService } from '@/shared/api/daoService/daoService';
import { ReactQueryWrapper, generatePaginatedResponse } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { useProposalListByMemberAddress } from './useProposalListByMemberAddress';

describe('useProposalListByMemberAddress query', () => {
    const getProposalListByMemberSpy = jest.spyOn(daoService, 'getProposalListByMemberAddress');

    afterEach(() => {
        getProposalListByMemberSpy.mockReset();
    });

    it('fetches the proposal list for a given member address', async () => {
        const params = { queryParams: { creatorAddress: '0xCreator', daoId: '0xDao', pageSize: 3 } };
        const proposalList = [
            generateProposal({ id: 'proposal-0x1' }),
            generateProposal({ id: 'proposal-0x2' }),
            generateProposal({ id: 'proposal-0x3' }),
        ];
        const proposalListByMemberResponse = generatePaginatedResponse({ data: proposalList });

        getProposalListByMemberSpy.mockResolvedValue(proposalListByMemberResponse);

        const { result } = renderHook(() => useProposalListByMemberAddress(params), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(proposalListByMemberResponse));
    });
});

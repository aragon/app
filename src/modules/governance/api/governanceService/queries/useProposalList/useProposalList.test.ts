import { generateProposal } from '@/modules/governance/testUtils';
import { ReactQueryWrapper, generatePaginatedResponse } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { governanceService } from '../../governanceService';
import { useProposalList } from './useProposalList';

describe('useProposalList query', () => {
    const governanceServiceSpy = jest.spyOn(governanceService, 'getProposalList');

    afterEach(() => {
        governanceServiceSpy.mockReset();
    });

    it('fetches the proposals of the specified DAO', async () => {
        const params = { daoId: 'dao-id-test', pluginAddress: '0x123' };
        const proposalsResult = generatePaginatedResponse({ data: [generateProposal()] });
        governanceServiceSpy.mockResolvedValue(proposalsResult);
        const { result } = renderHook(() => useProposalList({ queryParams: params }), { wrapper: ReactQueryWrapper });
        await waitFor(() => expect(result.current.data?.pages[0]).toEqual(proposalsResult));
    });
});

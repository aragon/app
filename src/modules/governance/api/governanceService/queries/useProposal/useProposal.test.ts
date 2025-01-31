import { generateProposal } from '@/modules/governance/testUtils';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { governanceService } from '../../governanceService';
import { useProposal } from './useProposal';

describe('useProposal query', () => {
    const getProposalBySlugSpy = jest.spyOn(governanceService, 'getProposalBySlug');

    afterEach(() => {
        getProposalBySlugSpy.mockReset();
    });

    it('fetches the specified proposal', async () => {
        const proposal = generateProposal();
        getProposalBySlugSpy.mockResolvedValue(proposal);

        const urlParams = {
            urlParams: { slug: proposal.id },
            queryParams: { daoId: 'test-id' },
        };
        const { result } = renderHook(() => useProposal(urlParams), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data).toEqual(proposal));
    });
});

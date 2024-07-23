import { generateProposal } from '@/modules/governance/testUtils';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { governanceService } from '../../governanceService';
import { useProposal } from './useProposal';

describe('useProposal query', () => {
    const getProposalSpy = jest.spyOn(governanceService, 'getProposal');

    afterEach(() => {
        getProposalSpy.mockReset();
    });

    it('fetches the specified proposal', async () => {
        const proposal = generateProposal();
        getProposalSpy.mockResolvedValue(proposal);

        const urlParams = { id: proposal.id };
        const { result } = renderHook(() => useProposal({ urlParams }), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data).toEqual(proposal));
    });
});

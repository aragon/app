import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { renderHook, waitFor } from '@testing-library/react';
import { governanceService } from '../../governanceService';
import { useCanCreateProposal } from './useCanCreateProposal';

describe('useCanCreateProposal query', () => {
    const getCanCreateProposalSpy = jest.spyOn(governanceService, 'getCanCreateProposal');

    afterEach(() => {
        getCanCreateProposalSpy.mockReset();
    });

    it('fetches if the user can create proposal on the specified plugin', async () => {
        const canCreateProposal = true;
        getCanCreateProposalSpy.mockResolvedValue(canCreateProposal);

        const queryParams = { memberAddress: '0x123', pluginAddress: '0x456', network: Network.ARBITRUM_MAINNET };
        const { result } = renderHook(() => useCanCreateProposal({ queryParams }), { wrapper: ReactQueryWrapper });

        await waitFor(() => expect(result.current.data).toEqual(canCreateProposal));
    });
});

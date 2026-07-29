import { act, renderHook, waitFor } from '@testing-library/react';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { actionSimulationService } from '../../actionSimulationService';
import { useSimulateProposalActions } from './useSimulateProposalActions';

describe('useSimulateProposalActions mutation', () => {
    const simulateProposalActionsSpy = jest.spyOn(
        actionSimulationService,
        'simulateProposalActions',
    );

    afterEach(() => {
        simulateProposalActionsSpy.mockReset();
    });

    it('simulates actions and returns the result', async () => {
        const simulationResult = generateSimulationResult();
        const params = {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                pluginAddress: '0x123',
            },
            body: { actions: [{ to: '0x456', data: '0x000', value: '0' }] },
        };
        simulateProposalActionsSpy.mockResolvedValue(simulationResult);
        const { result } = renderHook(() => useSimulateProposalActions(), {
            wrapper: ReactQueryWrapper,
        });
        act(() => result.current.mutate(params));
        await waitFor(() =>
            expect(result.current.data).toEqual(simulationResult),
        );
        expect(simulateProposalActionsSpy).toHaveBeenCalledWith(params);
    });
});

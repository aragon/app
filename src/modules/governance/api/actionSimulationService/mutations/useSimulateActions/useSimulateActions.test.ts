import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { act, renderHook, waitFor } from '@testing-library/react';
import { actionSimulationService } from '../../actionSimulationService';
import { useSimulateActions } from './useSimulateActions';

describe('useSimulateActions mutation', () => {
    const simulateActionsSpy = jest.spyOn(actionSimulationService, 'simulateActions');

    afterEach(() => {
        simulateActionsSpy.mockReset();
    });

    it('simulates actions and returns the result', async () => {
        const simulationResult = {
            runAt: Date.now(),
            status: 'success' as const,
            url: 'https://tenderly.co/simulation/123',
        };
        const params = {
            urlParams: { network: Network.ETHEREUM_MAINNET, pluginAddress: '0x123' },
            body: [
                {
                    to: '0x456',
                    data: '0x000',
                    value: '0',
                },
            ],
        };
        simulateActionsSpy.mockResolvedValue(simulationResult);
        const { result } = renderHook(() => useSimulateActions(), { wrapper: ReactQueryWrapper });
        act(() => result.current.mutate(params));
        await waitFor(() => expect(result.current.data).toEqual(simulationResult));
        expect(simulateActionsSpy).toHaveBeenCalledWith(params);
    });
});

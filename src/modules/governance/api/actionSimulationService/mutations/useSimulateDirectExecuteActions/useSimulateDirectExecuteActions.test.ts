import { act, renderHook, waitFor } from '@testing-library/react';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { actionSimulationService } from '../../actionSimulationService';
import { useSimulateDirectExecuteActions } from './useSimulateDirectExecuteActions';

describe('useSimulateDirectExecuteActions mutation', () => {
    const simulateDirectExecuteActionsSpy = jest.spyOn(
        actionSimulationService,
        'simulateDirectExecuteActions',
    );

    afterEach(() => {
        simulateDirectExecuteActionsSpy.mockReset();
    });

    it('simulates direct-execute actions and returns the result', async () => {
        const simulationResult = generateSimulationResult();
        const params = {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                daoAddress: '0xdao',
            },
            body: {
                from: '0xwallet',
                actions: [{ to: '0x456', data: '0x000', value: '0' }],
            },
        };
        simulateDirectExecuteActionsSpy.mockResolvedValue(simulationResult);
        const { result } = renderHook(() => useSimulateDirectExecuteActions(), {
            wrapper: ReactQueryWrapper,
        });
        act(() => result.current.mutate(params));
        await waitFor(() =>
            expect(result.current.data).toEqual(simulationResult),
        );
        expect(simulateDirectExecuteActionsSpy).toHaveBeenCalledWith(params);
    });
});

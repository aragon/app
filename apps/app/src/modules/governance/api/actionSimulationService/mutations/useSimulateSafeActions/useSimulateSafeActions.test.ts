import { act, renderHook, waitFor } from '@testing-library/react';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { actionSimulationService } from '../../actionSimulationService';
import { useSimulateSafeActions } from './useSimulateSafeActions';

describe('useSimulateSafeActions mutation', () => {
    const simulateSafeActionsSpy = jest.spyOn(
        actionSimulationService,
        'simulateSafeActions',
    );

    afterEach(() => {
        simulateSafeActionsSpy.mockReset();
    });

    it('simulates the Safe transaction and returns the result', async () => {
        const simulationResult = generateSimulationResult();
        const params = {
            urlParams: {
                network: Network.ETHEREUM_MAINNET,
                safeAddress: '0xsafe',
            },
            body: {
                to: '0x456',
                value: '0',
                data: '0x000',
                operation: 0 as const,
            },
        };
        simulateSafeActionsSpy.mockResolvedValue(simulationResult);
        const { result } = renderHook(() => useSimulateSafeActions(), {
            wrapper: ReactQueryWrapper,
        });
        act(() => result.current.mutate(params));
        await waitFor(() =>
            expect(result.current.data).toEqual(simulationResult),
        );
        expect(simulateSafeActionsSpy).toHaveBeenCalledWith(params);
    });
});

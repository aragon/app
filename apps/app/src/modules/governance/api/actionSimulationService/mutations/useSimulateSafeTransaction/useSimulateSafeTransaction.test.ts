import { act, renderHook, waitFor } from '@testing-library/react';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { actionSimulationService } from '../../actionSimulationService';
import { useSimulateSafeTransaction } from './useSimulateSafeTransaction';

describe('useSimulateSafeTransaction mutation', () => {
    const simulateSafeTransactionSpy = jest.spyOn(
        actionSimulationService,
        'simulateSafeTransaction',
    );

    afterEach(() => {
        simulateSafeTransactionSpy.mockReset();
    });

    it('simulates a pending Safe transaction and returns the result', async () => {
        const simulationResult = generateSimulationResult();
        const params = {
            urlParams: {
                network: Network.ETHEREUM_SEPOLIA,
                safeAddress: '0x123',
                safeTxHash: '0xabc',
            },
        };
        simulateSafeTransactionSpy.mockResolvedValue(simulationResult);

        const { result } = renderHook(() => useSimulateSafeTransaction(), {
            wrapper: ReactQueryWrapper,
        });
        act(() => result.current.mutate(params));

        await waitFor(() =>
            expect(result.current.data).toEqual(simulationResult),
        );
        expect(simulateSafeTransactionSpy).toHaveBeenCalledWith(params);
    });
});

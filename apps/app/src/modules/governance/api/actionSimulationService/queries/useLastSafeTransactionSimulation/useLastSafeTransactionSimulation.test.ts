import { renderHook, waitFor } from '@testing-library/react';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { actionSimulationService } from '../../actionSimulationService';
import { useLastSafeTransactionSimulation } from './useLastSafeTransactionSimulation';

describe('useLastSafeTransactionSimulation query', () => {
    const getLastSafeTransactionSimulationSpy = jest.spyOn(
        actionSimulationService,
        'getLastSafeTransactionSimulation',
    );

    afterEach(() => {
        getLastSafeTransactionSimulationSpy.mockReset();
    });

    it('fetches the last simulation of a pending Safe transaction', async () => {
        const simulationResult = generateSimulationResult();
        const params = {
            urlParams: {
                network: Network.ETHEREUM_SEPOLIA,
                safeAddress: '0x123',
                safeTxHash: '0xabc',
            },
        };
        getLastSafeTransactionSimulationSpy.mockResolvedValue(simulationResult);

        const { result } = renderHook(
            () => useLastSafeTransactionSimulation(params),
            { wrapper: ReactQueryWrapper },
        );

        await waitFor(() =>
            expect(result.current.data).toEqual(simulationResult),
        );
        expect(getLastSafeTransactionSimulationSpy).toHaveBeenCalledWith(
            params,
        );
    });
});

import { renderHook, waitFor } from '@testing-library/react';
import { generateSimulationResult } from '@/modules/governance/testUtils';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { actionSimulationService } from '../../actionSimulationService';
import { useLastSimulation } from './useLastSimulation';

describe('useLastSimulation query', () => {
    const getLastSimulationSpy = jest.spyOn(
        actionSimulationService,
        'getLastSimulation',
    );

    afterEach(() => {
        getLastSimulationSpy.mockReset();
    });

    it('fetches last simulation result for a proposal', async () => {
        const simulationResult = generateSimulationResult();
        const params = { urlParams: { proposalId: 'proposal-123' } };
        getLastSimulationSpy.mockResolvedValue(simulationResult);
        const { result } = renderHook(() => useLastSimulation(params), {
            wrapper: ReactQueryWrapper,
        });
        await waitFor(() =>
            expect(result.current.data).toEqual(simulationResult),
        );
        expect(getLastSimulationSpy).toHaveBeenCalledWith(params);
    });
});

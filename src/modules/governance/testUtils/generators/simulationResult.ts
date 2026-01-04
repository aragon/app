import type { ISimulationResult } from '../../api/actionSimulationService';

export const generateSimulationResult = (
    simulationResut?: Partial<ISimulationResult>,
): ISimulationResult => ({
    runAt: 0,
    status: 'success',
    url: 'https://tenderly.co/simulation/123',
    ...simulationResut,
});

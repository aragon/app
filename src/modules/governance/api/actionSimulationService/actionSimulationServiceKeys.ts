import type { IGetLastSimulationParams } from './actionSimulationService.api';

export enum ActionSimulationServiceKey {
    LAST_SIMULATION = 'LAST_SIMULATION',
}

export const actionSimulationServiceKeys = {
    lastSimulation: (params: IGetLastSimulationParams) => [ActionSimulationServiceKey.LAST_SIMULATION, params],
};

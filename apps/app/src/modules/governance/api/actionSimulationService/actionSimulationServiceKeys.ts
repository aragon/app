import type {
    IGetLastSafeTransactionSimulationParams,
    IGetLastSimulationParams,
} from './actionSimulationService.api';

export enum ActionSimulationServiceKey {
    LAST_SIMULATION = 'LAST_SIMULATION',
    LAST_SAFE_TRANSACTION_SIMULATION = 'LAST_SAFE_TRANSACTION_SIMULATION',
}

export const actionSimulationServiceKeys = {
    lastSimulation: (params: IGetLastSimulationParams) => [
        ActionSimulationServiceKey.LAST_SIMULATION,
        params,
    ],
    lastSafeTransactionSimulation: (
        params: IGetLastSafeTransactionSimulationParams,
    ) => [ActionSimulationServiceKey.LAST_SAFE_TRANSACTION_SIMULATION, params],
};

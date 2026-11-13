import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type {
    IGetLastSafeTransactionSimulationParams,
    IGetLastSimulationParams,
    ISimulateDirectExecuteActionsParams,
    ISimulateProposalActionsParams,
    ISimulateProposalParams,
    ISimulateSafeTransactionParams,
} from './actionSimulationService.api';
import type { ISimulationResult } from './domain';

class ActionSimulationService extends AragonBackendService {
    private urls = {
        simulateProposalActions:
            '/v2/simulations/:network/plugin/:pluginAddress/simulate',
        simulateDirectExecuteActions:
            '/v2/simulations/:network/dao/:daoAddress/simulate',
        simulateProposal: '/v2/simulations/proposal/:proposalId',
        getLastSimulation: '/v2/simulations/proposal/:proposalId',
        simulateSafeTransaction:
            '/v2/simulations/:network/safe/:safeAddress/transactions/:safeTxHash',
        getLastSafeTransactionSimulation:
            '/v2/simulations/:network/safe/:safeAddress/transactions/:safeTxHash',
    };

    simulateProposalActions = async (
        params: ISimulateProposalActionsParams,
    ): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(
            this.urls.simulateProposalActions,
            params,
            { method: 'POST' },
        );

        return result;
    };

    simulateDirectExecuteActions = async (
        params: ISimulateDirectExecuteActionsParams,
    ): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(
            this.urls.simulateDirectExecuteActions,
            params,
            { method: 'POST' },
        );

        return result;
    };

    simulateProposal = async (
        params: ISimulateProposalParams,
    ): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(
            this.urls.simulateProposal,
            params,
            { method: 'POST' },
        );

        return result;
    };

    getLastSimulation = async (
        params: IGetLastSimulationParams,
    ): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(
            this.urls.getLastSimulation,
            params,
        );

        return result;
    };

    /**
     * Simulates a pending Safe transaction and stores the run. The backend reads the transaction from the Safe queue
     * by its hash, so no calldata is sent.
     */
    simulateSafeTransaction = async (
        params: ISimulateSafeTransactionParams,
    ): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(
            this.urls.simulateSafeTransaction,
            params,
            { method: 'POST' },
        );

        return result;
    };

    /**
     * Reads the last stored simulation of a pending Safe transaction. Fails with a not-found error when it was never
     * simulated.
     */
    getLastSafeTransactionSimulation = async (
        params: IGetLastSafeTransactionSimulationParams,
    ): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(
            this.urls.getLastSafeTransactionSimulation,
            params,
        );

        return result;
    };
}

export const actionSimulationService = new ActionSimulationService();

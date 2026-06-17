import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type {
    IGetLastSimulationParams,
    ISimulateDirectExecuteActionsParams,
    ISimulateProposalActionsParams,
    ISimulateProposalParams,
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
}

export const actionSimulationService = new ActionSimulationService();

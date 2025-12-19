import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type {
    IGetLastSimulationParams,
    ISimulateActionsParams,
    ISimulateProposalParams,
} from './actionSimulationService.api';
import type { ISimulationResult } from './domain';

class ActionSimulationService extends AragonBackendService {
    private urls = {
        simulateActions:
            '/v2/simulations/:network/plugin/:pluginAddress/simulate',
        simulateProposal: '/v2/simulations/proposal/:proposalId',
        getLastSimulation: '/v2/simulations/proposal/:proposalId',
    };

    simulateActions = async (
        params: ISimulateActionsParams,
    ): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(
            this.urls.simulateActions,
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

import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type {
    IGetLastSimulationParams,
    ISimulateActionsParams,
    ISimulateProposalParams,
} from './actionSimulationService.api';
import type { ISimulationResult } from './domain';

class ActionSimulationService extends AragonBackendService {
    private urls = {
        simulateActions: '/v2/simulations/:network/simulate',
        simulateProposal: '/v2/simulations/proposal/:proposalId',
        getLastSimulation: '/v2/simulations/proposal/:proposalId',
    };

    /**
     * Simulates actions with the given parameters.
     */
    simulateActions = async (params: ISimulateActionsParams): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(this.urls.simulateActions, params, { method: 'POST' });

        return result;
    };

    /**
     * Simulates all actions of a proposal.
     */
    simulateProposal = async (params: ISimulateProposalParams): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(this.urls.simulateProposal, params, { method: 'POST' });

        return result;
    };

    /**
     * Gets the last simulation result for a proposal.
     */
    getLastSimulation = async (params: IGetLastSimulationParams): Promise<ISimulationResult> => {
        const result = await this.request<ISimulationResult>(this.urls.getLastSimulation, params);

        return result;
    };
}

export const actionSimulationService = new ActionSimulationService();

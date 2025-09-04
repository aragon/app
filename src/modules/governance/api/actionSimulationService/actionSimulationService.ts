import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type {
    IGetLastSimulationParams,
    ISimulateActionsParams,
    ISimulateProposalParams,
} from './actionSimulationService.api';
import type { ISimulationResult } from './domain';

class ActionSimulationService extends AragonBackendService {
    private urls = {
        simulateActions: '/v2/simulations/:network/plugin/:pluginAddress/simulate',
        simulateProposal: '/v2/simulations/proposal/:proposalId',
        getLastSimulation: '/v2/simulations/proposal/:proposalId',
    };

    /**
     * Simulates actions with the given parameters.
     */
    simulateActions = async (params: ISimulateActionsParams): Promise<ISimulationResult> => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return {
            status: 'success',
            url: 'https://www.tdly.co/shared/simulation/27d74641-7e37-4907-9d2f-4dee336ffbad',
            runAt: 1756967063798,
        };

        const result = await this.request<ISimulationResult>(this.urls.simulateActions, params, { method: 'POST' });

        return result;
    };

    /**
     * Simulates all actions of a proposal.
     */
    simulateProposal = async (params: ISimulateProposalParams): Promise<ISimulationResult> => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return {
            url: 'https://www.tdly.co/shared/simulation/2c3921cd-dbb1-47a5-af0c-167c532fcad3',
            status: 'success',
            runAt: 1756968272681,
        };
        const result = await this.request<ISimulationResult>(this.urls.simulateProposal, params, { method: 'POST' });

        return result;
    };

    /**
     * Gets the last simulation result for a proposal.
     */
    getLastSimulation = async (params: IGetLastSimulationParams): Promise<ISimulationResult> => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return {
            status: 'success',
            url: 'https://www.tdly.co/shared/simulation/2c3921cd-dbb1-47a5-af0c-167c532fcad3',
            runAt: 1756968272681,
        };

        const result = await this.request<ISimulationResult>(this.urls.getLastSimulation, params);

        return result;
    };
}

export const actionSimulationService = new ActionSimulationService();

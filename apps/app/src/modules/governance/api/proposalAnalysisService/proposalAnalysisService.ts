import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IProposalAnalysis } from './domain';
import type { IGenerateProposalAnalysisParams } from './proposalAnalysisService.api';

class ProposalAnalysisService extends AragonBackendService {
    private urls = {
        generateProposalAnalysis: '/v2/proposals/:proposalId/analysis',
    };

    generateProposalAnalysis = async (
        params: IGenerateProposalAnalysisParams,
    ): Promise<IProposalAnalysis> => {
        const result = await this.request<IProposalAnalysis>(
            this.urls.generateProposalAnalysis,
            params,
            { method: 'POST' },
        );

        return result;
    };
}

export const proposalAnalysisService = new ProposalAnalysisService();

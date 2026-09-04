import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IProposalAnalysis } from '../../domain';
import { proposalAnalysisService } from '../../proposalAnalysisService';
import type { IGenerateProposalAnalysisParams } from '../../proposalAnalysisService.api';

export const useGenerateProposalAnalysis = (
    options?: MutationOptions<
        IProposalAnalysis,
        unknown,
        IGenerateProposalAnalysisParams
    >,
) =>
    useMutation({
        mutationFn: (params) =>
            proposalAnalysisService.generateProposalAnalysis(params),
        ...options,
    });

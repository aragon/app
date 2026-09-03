import { act, renderHook, waitFor } from '@testing-library/react';
import { generateProposalAnalysis } from '@/modules/governance/testUtils';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { proposalAnalysisService } from '../../proposalAnalysisService';
import { useGenerateProposalAnalysis } from './useGenerateProposalAnalysis';

describe('useGenerateProposalAnalysis mutation', () => {
    const generateProposalAnalysisSpy = jest.spyOn(
        proposalAnalysisService,
        'generateProposalAnalysis',
    );

    afterEach(() => {
        generateProposalAnalysisSpy.mockReset();
    });

    it('generates the analysis and returns the report', async () => {
        const analysis = generateProposalAnalysis();
        const params = {
            urlParams: { proposalId: 'proposal-123' },
            body: { assistantUrl: 'http://localhost:4000' },
        };
        generateProposalAnalysisSpy.mockResolvedValue(analysis);
        const { result } = renderHook(() => useGenerateProposalAnalysis(), {
            wrapper: ReactQueryWrapper,
        });
        act(() => result.current.mutate(params));
        await waitFor(() => expect(result.current.data).toEqual(analysis));
        expect(generateProposalAnalysisSpy).toHaveBeenCalledWith(params);
    });
});

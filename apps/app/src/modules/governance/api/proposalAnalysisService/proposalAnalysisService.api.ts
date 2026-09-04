import type { IRequestUrlBodyParams } from '@/shared/api/httpService';

export interface IGenerateProposalAnalysisUrlParams {
    /**
     * ID of the proposal to analyse.
     */
    proposalId: string;
}

export interface IGenerateProposalAnalysisBody {
    /**
     * Assistant service the backend should ask for the written report. The app passes its own
     * `NEXT_PUBLIC_ASSISTANT_URL` so a preview or sandbox backend reaches the matching assistant
     * deployment without a redeploy; the backend only accepts hosts from its allowlist.
     */
    assistantUrl?: string;
}

export interface IGenerateProposalAnalysisParams
    extends IRequestUrlBodyParams<
        IGenerateProposalAnalysisUrlParams,
        IGenerateProposalAnalysisBody
    > {}

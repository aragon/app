import {
    type IProposalAnalysisFinding,
    type IProposalAnalysisReport,
    type IProposalAnalysisRequest,
    type IProposalAnalysisSeverity,
    proposalAnalysisReportSchema,
    proposalAnalysisSeverityRank,
} from '@aragon/assistant-contracts';
import { generateObject, type LanguageModel } from 'ai';
import {
    analysisMaxOutputTokens,
    analysisTimeoutMs,
    getAnalysisProviderOptions,
} from './models';
import {
    buildAnalysisSystemPrompt,
    buildAnalysisUserPrompt,
} from './prompts/analysisPrompt';

export interface IGeneratedReport {
    report: IProposalAnalysisReport;
    rulesSeverity: IProposalAnalysisSeverity;
    // The model that answered; under a gateway fallback it differs from the requested one.
    model: string;
    finishReason: string;
    tokensIn?: number;
    tokensOut?: number;
}

// The highest of the given severities; routine when there are none.
export const maxSeverity = (
    ...severities: IProposalAnalysisSeverity[]
): IProposalAnalysisSeverity =>
    severities.reduce<IProposalAnalysisSeverity>(
        (winner, severity) =>
            proposalAnalysisSeverityRank[severity] >
            proposalAnalysisSeverityRank[winner]
                ? severity
                : winner,
        'routine',
    );

export const rulesSeverityOf = (
    findings: IProposalAnalysisFinding[],
): IProposalAnalysisSeverity =>
    maxSeverity(...findings.map((finding) => finding.severity));

// Two things the schema alone cannot enforce. The floor: the model may only raise the rules'
// severity, and a proposal text asking to be "marked safe" must not be able to lower it. The
// references: the model refers to actions by index, and an index outside the fact pack would make
// the renderer show nothing or the wrong action, so unknown indices are dropped.
export const enforceReportInvariants = (
    report: IProposalAnalysisReport,
    rulesSeverity: IProposalAnalysisSeverity,
    actionCount: number,
): IProposalAnalysisReport => {
    const validRefs = (refs: number[]) =>
        [...new Set(refs)]
            .filter((ref) => ref < actionCount)
            .sort((a, b) => a - b);

    return {
        ...report,
        whatItDoes: report.whatItDoes.map((item) => ({
            ...item,
            actionRefs: validRefs(item.actionRefs),
        })),
        intentMismatch: {
            ...report.intentMismatch,
            actionRefs: validRefs(report.intentMismatch.actionRefs),
        },
        severity: maxSeverity(rulesSeverity, report.severity),
    };
};

export const generateReport = async (params: {
    model: LanguageModel;
    request: IProposalAnalysisRequest;
}): Promise<IGeneratedReport> => {
    const { model, request } = params;
    const rulesSeverity = rulesSeverityOf(request.findings);

    const result = await generateObject({
        model,
        schema: proposalAnalysisReportSchema,
        system: buildAnalysisSystemPrompt(rulesSeverity),
        prompt: buildAnalysisUserPrompt(request),
        providerOptions: getAnalysisProviderOptions(),
        abortSignal: AbortSignal.timeout(analysisTimeoutMs),
        maxOutputTokens: analysisMaxOutputTokens,
    });

    return {
        report: enforceReportInvariants(
            result.object,
            rulesSeverity,
            request.factPack.actions.length,
        ),
        rulesSeverity,
        model: result.response.modelId,
        finishReason: result.finishReason,
        tokensIn: result.usage.inputTokens,
        tokensOut: result.usage.outputTokens,
    };
};

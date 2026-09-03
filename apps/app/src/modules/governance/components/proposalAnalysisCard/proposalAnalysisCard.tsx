'use client';

import {
    AlertInline,
    Button,
    formatterUtils,
    NumberFormat,
    Tag,
    type TagVariant,
} from '@aragon/gov-ui-kit';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    type IProposalAnalysis,
    type IProposalAnalysisAction,
    type ProposalAnalysisIntentVerdict,
    type ProposalAnalysisSeverity,
    useGenerateProposalAnalysis,
} from '../../api/proposalAnalysisService';

export interface IProposalAnalysisCardProps {
    /**
     * ID of the proposal to analyse.
     */
    proposalId: string;
}

const severityToTagVariant: Record<ProposalAnalysisSeverity, TagVariant> = {
    routine: 'success',
    review: 'warning',
    high: 'critical',
};

const verdictToTagVariant: Record<ProposalAnalysisIntentVerdict, TagVariant> = {
    aligned: 'success',
    partial: 'warning',
    contradicted: 'critical',
};

/**
 * Aside card with the AI analysis of a proposal. The report is generated on demand by the backend
 * (fact pack + rules, prose by the assistant) and kept in the mutation state: nothing is stored
 * yet. The model never writes amounts or addresses; every sentence points at fact-pack actions by
 * index, and this card renders those values from the fact pack next to the sentence.
 */
export const ProposalAnalysisCard: React.FC<IProposalAnalysisCardProps> = (
    props,
) => {
    const { proposalId } = props;

    const { t } = useTranslations();
    const { isEnabled } = useFeatureFlags();

    const {
        mutate: generateAnalysis,
        data: analysis,
        isPending,
        isError,
        error,
    } = useGenerateProposalAnalysis();

    if (!isEnabled('aiProposalAnalysis')) {
        return null;
    }

    const handleGenerate = () => {
        // The app knows which assistant deployment it was built against; passing it lets a sandbox
        // or preview backend reach the same one without a redeploy.
        const assistantUrl = process.env.NEXT_PUBLIC_ASSISTANT_URL || undefined;
        generateAnalysis({ urlParams: { proposalId }, body: { assistantUrl } });
    };

    // A 404 means the DAO is outside the backend allowlist, not a failure.
    const isNotAvailable = AragonBackendServiceError.isNotFoundError(error);

    const formatActionRef = (ref: number): string => {
        const action: IProposalAnalysisAction | undefined =
            analysis?.factPack.actions[ref];
        const parts = [
            t('app.governance.proposalAnalysisCard.actionRef', {
                index: ref + 1,
            }),
        ];

        if (action == null) {
            return parts[0];
        }

        const label = action.functionName ?? action.type;
        parts.push(
            action.targetName ? `${label} · ${action.targetName}` : label,
        );

        const transfer = action.transfer;
        if (transfer?.amount != null) {
            const amount = formatterUtils.formatNumber(
                Number(transfer.amount),
                {
                    format: NumberFormat.TOKEN_AMOUNT_SHORT,
                },
            );
            parts.push([amount, transfer.symbol].filter(Boolean).join(' '));
        }

        return parts.join(' · ');
    };

    const renderActionRefs = (refs: number[]) =>
        refs.length > 0 && (
            <ul className="mt-1 flex flex-col gap-0.5">
                {refs.map((ref) => (
                    <li className="text-neutral-500 text-sm" key={ref}>
                        {formatActionRef(ref)}
                    </li>
                ))}
            </ul>
        );

    const renderReport = (result: IProposalAnalysis) => {
        const { report, model } = result;

        return (
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Tag
                        className="w-fit"
                        label={t(
                            `app.governance.proposalAnalysisCard.severity.${report.severity}`,
                        )}
                        variant={severityToTagVariant[report.severity]}
                    />
                    <p className="font-semibold text-neutral-800">
                        {report.headline}
                    </p>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-neutral-800 text-sm">
                        {t('app.governance.proposalAnalysisCard.whatItDoes')}
                    </p>
                    <ul className="flex flex-col gap-2">
                        {report.whatItDoes.map((item, index) => (
                            <li className="text-neutral-800" key={index}>
                                {item.text}
                                {renderActionRefs(item.actionRefs)}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-neutral-800 text-sm">
                        {t('app.governance.proposalAnalysisCard.intent.title')}
                    </p>
                    <Tag
                        className="w-fit"
                        label={t(
                            `app.governance.proposalAnalysisCard.intent.${report.intentMismatch.verdict}`,
                        )}
                        variant={
                            verdictToTagVariant[report.intentMismatch.verdict]
                        }
                    />
                    <p className="text-neutral-800">
                        {report.intentMismatch.explanation}
                    </p>
                    {renderActionRefs(report.intentMismatch.actionRefs)}
                </div>
                <div className="flex flex-col gap-1">
                    <p className="font-semibold text-neutral-800 text-sm">
                        {t('app.governance.proposalAnalysisCard.whyItMatters')}
                    </p>
                    <p className="text-neutral-800">{report.whyItMatters}</p>
                </div>
                {report.openQuestions.length > 0 && (
                    <div className="flex flex-col gap-1">
                        <p className="font-semibold text-neutral-800 text-sm">
                            {t(
                                'app.governance.proposalAnalysisCard.openQuestions',
                            )}
                        </p>
                        <ul className="list-disc pl-4">
                            {report.openQuestions.map((question, index) => (
                                <li className="text-neutral-800" key={index}>
                                    {question}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <p className="text-neutral-500 text-sm">
                    {t('app.governance.proposalAnalysisCard.model', { model })}
                </p>
                <Button
                    className="w-full"
                    isLoading={isPending}
                    onClick={handleGenerate}
                    size="md"
                    variant="tertiary"
                >
                    {t('app.governance.proposalAnalysisCard.regenerate')}
                </Button>
            </div>
        );
    };

    const renderEmptyState = () => (
        <>
            <p className="text-neutral-500">
                {t('app.governance.proposalAnalysisCard.description')}
            </p>
            {isError && (
                <AlertInline
                    message={t('app.governance.proposalAnalysisCard.error')}
                    variant="critical"
                />
            )}
            <Button
                className="w-full"
                isLoading={isPending}
                onClick={handleGenerate}
                size="md"
                variant="secondary"
            >
                {t('app.governance.proposalAnalysisCard.action')}
            </Button>
        </>
    );

    return (
        <Page.AsideCard
            data-testid="proposal-analysis-card"
            title={t('app.governance.proposalAnalysisCard.title')}
        >
            {isNotAvailable ? (
                <p className="text-neutral-500">
                    {t('app.governance.proposalAnalysisCard.notAvailable')}
                </p>
            ) : analysis != null ? (
                renderReport(analysis)
            ) : (
                renderEmptyState()
            )}
            <p className="text-neutral-500 text-sm">
                {t('app.governance.proposalAnalysisCard.disclaimer')}
            </p>
        </Page.AsideCard>
    );
};

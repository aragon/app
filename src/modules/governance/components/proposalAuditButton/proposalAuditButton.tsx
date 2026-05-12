'use client';

import { Button, IconType } from '@aragon/gov-ui-kit';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    GovernanceServiceKey,
    type IProposal,
} from '../../api/governanceService';
import { useRunProposalAudit } from '../../api/proposalAuditService';
import { GovernanceDialogId } from '../../constants/governanceDialogId';
import type { IProposalAuditDialogParams } from '../../dialogs/proposalAuditDialog';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IProposalAuditSectionProps {
    proposal: IProposal;
    daoId: string;
}

export const ProposalAuditSection: React.FC<IProposalAuditSectionProps> = ({
    proposal,
    daoId,
}) => {
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const queryClient = useQueryClient();
    const {
        mutate: runAudit,
        isPending: isAuditRunning,
        isError: hasAuditError,
        error: auditError,
    } = useRunProposalAudit();

    const [auditPhase, setAuditPhase] = useState(0);

    useEffect(() => {
        if (!isAuditRunning) {
            setAuditPhase(0);
            return;
        }
        const timers = [
            setTimeout(() => setAuditPhase(1), 5000),
            setTimeout(() => setAuditPhase(2), 15000),
        ];
        return () => timers.forEach(clearTimeout);
    }, [isAuditRunning]);

    const AUDIT_PHASES = [
        'Simulating proposal actions...',
        'Analyzing results with AI...',
        'Generating security report...',
    ];

    const isExecuted = proposal.executed.status;
    const hasAudit = proposal.audit != null;

    // Hide section on executed proposals without audit
    if (isExecuted && !hasAudit) return null;

    const openAuditDialog = (audit: IProposalAuditDialogParams['audit']) =>
        open(GovernanceDialogId.PROPOSAL_AUDIT, { params: { audit } });

    const handleRunAudit = () => {
        runAudit(
            { urlParams: { id: proposal.id } },
            {
                onSuccess: (audit) => {
                    openAuditDialog(audit);
                    void queryClient.invalidateQueries({
                        predicate: ({ queryKey }) =>
                            queryKey[0] ===
                                GovernanceServiceKey.PROPOSAL_BY_SLUG ||
                            queryKey[0] ===
                                GovernanceServiceKey.PROPOSAL_LIST,
                    });
                },
            },
        );
    };

    const handleViewAudit = () => {
        if (proposal.audit) {
            openAuditDialog(proposal.audit);
        }
    };

    if (hasAudit) {
        const summaryText = proposal.audit!.summary;
        const shortSummary =
            summaryText.length > 200
                ? `${summaryText.slice(0, 200)}...`
                : summaryText;

        return (
            <div className="flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-4">
                <h3 className="font-semibold text-neutral-800">
                    Security Audit
                </h3>
                <p className="text-neutral-500 text-sm">
                    {shortSummary}
                </p>
                <Button
                    className="w-full md:w-fit"
                    iconLeft={IconType.RICHTEXT_LIST_UNORDERED}
                    onClick={handleViewAudit}
                    size="md"
                    variant="secondary"
                >
                    View Full Report
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-4">
            <h3 className="font-semibold text-neutral-800">
                Security Audit
            </h3>
            {isAuditRunning ? (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
                        <p className="text-neutral-600 text-sm font-medium">
                            {AUDIT_PHASES[auditPhase]}
                        </p>
                    </div>
                    <p className="text-neutral-400 text-xs">
                        This may take a moment. The proposal is being simulated
                        on-chain and analyzed for potential risks.
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-neutral-500 text-sm">
                        Run an AI-powered security audit to analyze what this
                        proposal's actions will produce when executed.
                    </p>
                    {hasAuditError && (
                        <p className="text-critical-600 text-sm">
                            Audit failed. Please try again.
                        </p>
                    )}
                    <Button
                        className="w-full md:w-fit"
                        disabled={isExecuted}
                        iconLeft={IconType.WARNING}
                        onClick={handleRunAudit}
                        size="md"
                        variant="secondary"
                    >
                        Run Audit
                    </Button>
                </>
            )}
        </div>
    );
};
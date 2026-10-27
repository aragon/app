'use client';

import {
    formatterUtils,
    NumberFormat,
    ProposalVoting,
    ProposalVotingTab,
    StateSkeletonBar,
    Tabs,
    useGukModulesContext,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';

/** Confirmation progress for a Safe acting as a staged proposal body. */
export interface ISafeMultisigProposalVotingBreakdownProps {
    /** Staged proposal containing the Safe body's decision. */
    proposal: ISppProposal;
    /** Address of the Safe body. */
    body: string;
    /** Stage whose report is displayed. */
    stage: ISppStage;
    /** Whether the body reports a veto rather than an approval. */
    isVeto?: boolean;
    /** Actions and stage status displayed below the breakdown. */
    children?: ReactNode;
}

/**
 * Breakdown of a Safe body, using the current owner count as the denominator.
 *
 * A recovered report supplies the historical approvals and threshold. The live Safe supplies the
 * current approvals and threshold, while the neutral variant keeps reaching that threshold from
 * being presented as a settled result.
 */
export const SafeMultisigProposalVotingBreakdown: React.FC<
    ISafeMultisigProposalVotingBreakdownProps
> = (props) => {
    const { proposal, body, stage, isVeto, children } = props;
    const { copy } = useGukModulesContext();
    const {
        safeInfo,
        approvalsAmount,
        minApprovals,
        membersCount,
        settledReport,
    } = useSafeMultisigBodyState({
        network: proposal.network,
        address: body,
        proposal,
        stage,
    });

    if (safeInfo == null || membersCount == null || membersCount <= 0) {
        return (
            <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
                <div className="rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-4 shadow-neutral-sm md:px-6 md:py-6">
                    <div className="flex flex-col gap-2">
                        <StateSkeletonBar size="lg" width="40%" />
                        <StateSkeletonBar size="lg" width="70%" />
                    </div>
                </div>
                {children}
            </Tabs.Content>
        );
    }

    if (settledReport != null) {
        return (
            <ProposalVoting.BreakdownMultisig
                approvalsAmount={settledReport.transaction.confirmations.length}
                isVeto={isVeto}
                membersCount={membersCount}
                minApprovals={settledReport.transaction.confirmationsRequired}
            >
                {children}
            </ProposalVoting.BreakdownMultisig>
        );
    }

    const formattedMembersCount = formatterUtils.formatNumber(membersCount, {
        format: NumberFormat.GENERIC_SHORT,
    })!;

    return (
        <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
            <ProposalVoting.Progress.Container>
                <ProposalVoting.Progress.Item
                    description={{
                        value: formatterUtils.formatNumber(approvalsAmount, {
                            format: NumberFormat.GENERIC_SHORT,
                        }),
                        text: copy.proposalVotingBreakdownMultisig.description(
                            formattedMembersCount,
                        ),
                    }}
                    name={
                        copy.proposalVotingBreakdownMultisig[
                            isVeto ? 'nameVeto' : 'name'
                        ]
                    }
                    showStatus={approvalsAmount < minApprovals}
                    thresholdIndicator={(minApprovals / membersCount) * 100}
                    value={(approvalsAmount / membersCount) * 100}
                    variant="neutral"
                />
            </ProposalVoting.Progress.Container>
            {children}
        </Tabs.Content>
    );
};

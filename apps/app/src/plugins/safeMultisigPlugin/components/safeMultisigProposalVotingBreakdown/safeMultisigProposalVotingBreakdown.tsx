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

/** Props for the shared, SPP-independent Safe approval breakdown. */
export interface ISafeMultisigProposalVotingBreakdownViewProps {
    /** Number of confirmations on the transaction being displayed. */
    approvalsAmount: number;
    /** Confirmations required by that transaction. */
    minApprovals: number;
    /** Number of current Safe owners. */
    membersCount?: number;
    /** Whether the transaction has executed and represents settled history. */
    isSettled?: boolean;
    /** Whether the Safe is reporting a veto rather than an approval. */
    isVeto?: boolean;
    /** Actions and status displayed below the breakdown. */
    children?: ReactNode;
}

/**
 * Confirmation progress shared by the SPP Safe body and native Safe transactions.
 *
 * Unexecuted confirmations stay neutral even when threshold is reached: reaching the threshold
 * makes a Safe transaction executable, not a settled governance result.
 */
export const SafeMultisigProposalVotingBreakdownView: React.FC<
    ISafeMultisigProposalVotingBreakdownViewProps
> = (props) => {
    const {
        approvalsAmount,
        children,
        isSettled = false,
        isVeto = false,
        membersCount,
        minApprovals,
    } = props;
    const { copy } = useGukModulesContext();

    if (membersCount == null || membersCount <= 0) {
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

    if (isSettled) {
        return (
            <ProposalVoting.BreakdownMultisig
                approvalsAmount={approvalsAmount}
                isVeto={isVeto}
                membersCount={membersCount}
                minApprovals={minApprovals}
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
 * SPP adapter for the shared Safe approval breakdown.
 *
 * The adapter owns SPP reads; the rendered terminal stays independent from SPP data so native Safe
 * transactions can use the exact same presentation.
 */
export const SafeMultisigProposalVotingBreakdown: React.FC<
    ISafeMultisigProposalVotingBreakdownProps
> = (props) => {
    const { proposal, body, stage, isVeto, children } = props;
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

    return (
        <SafeMultisigProposalVotingBreakdownView
            approvalsAmount={
                settledReport?.transaction.confirmations.length ??
                approvalsAmount
            }
            isSettled={settledReport != null}
            isVeto={isVeto}
            membersCount={safeInfo == null ? undefined : membersCount}
            minApprovals={
                settledReport?.transaction.confirmationsRequired ?? minApprovals
            }
        >
            {children}
        </SafeMultisigProposalVotingBreakdownView>
    );
};

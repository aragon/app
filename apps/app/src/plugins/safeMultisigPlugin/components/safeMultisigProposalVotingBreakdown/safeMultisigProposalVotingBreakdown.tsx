'use client';

import {
    DateFormat,
    formatterUtils,
    Link,
    ProposalVoting,
    ProposalVotingTab,
    StateSkeletonBar,
    Tabs,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import {
    safeAppHistoryUrl,
    safeAppTransactionUrl,
} from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import { SafeSettledReportOutcome } from '../../hooks/useSafeSettledReport';

export interface ISafeMultisigProposalVotingBreakdownProps {
    proposal: ISppProposal;
    body: string;
    stage: ISppStage;
    isVeto?: boolean;
    children?: ReactNode;
}

const translationKey =
    'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown';

/**
 * Breakdown of a Safe body: the multisig approval summary, fed from live Safe state.
 *
 * The Safe's own particulars - address, threshold, nonce, version - are the body's standing
 * configuration and live in the Settings tab. Restating them here duplicated gov-ui-kit's own
 * approval header, and the per-owner signature state belongs to the Votes tab.
 */
export const SafeMultisigProposalVotingBreakdown: React.FC<
    ISafeMultisigProposalVotingBreakdownProps
> = (props) => {
    const { proposal, body, stage, isVeto, children } = props;
    const { t } = useTranslations();

    const {
        safeInfo,
        approvalsAmount,
        minApprovals,
        membersCount,
        isLoading,
        isError,
        isRateLimited,
        rateLimitedRetryAfter,
        settledResultType,
        settledReport,
        settledReportOutcome,
    } = useSafeMultisigBodyState({
        network: proposal.network,
        address: body,
        proposal,
        stage,
    });

    // A rate-limited read is a degraded state, not a bug: the poll backs off and recovers on its
    // own, so it must not read as the generic hard failure the user is expected to act on.
    //
    // Absent means "nothing to say yet" and draws the skeleton: a first read has no news, and
    // narrating it is worse than showing the shape of what is arriving.
    let placeholderText = isError ? t(`${translationKey}.error`) : undefined;

    if (isRateLimited) {
        // The service states its own wait, and it is the only thing here anyone can rely on: no
        // published Safe limit is hourly, so the app states the asked-for wait rather than
        // inventing a window. Rendered as a duration because "300 seconds" makes a reader divide.
        const retryWait =
            rateLimitedRetryAfter == null
                ? undefined
                : formatterUtils.formatDate(
                      Date.now() + rateLimitedRetryAfter * 1000,
                      { format: DateFormat.DURATION },
                  );

        placeholderText =
            retryWait == null
                ? t(`${translationKey}.rateLimited`)
                : t(`${translationKey}.rateLimitedRetry`, { wait: retryWait });
    }

    /**
     * Once the body has reported, the action slot is gone - the shared chrome stops rendering it as
     * soon as the proposal executes - so the provenance lives here, where the body always renders.
     *
     * The exact transaction when history has resolved it, the Safe's history as the fallback: the
     * settled read can be pending, stale or beyond its page, and "somewhere in this Safe" still
     * beats no link at all. Once the whole history has been walked without finding it, that stops
     * being true - the link would point at the history that demonstrably lacks it.
     */
    const historyHref =
        settledReportOutcome === SafeSettledReportOutcome.NOT_REPORTED
            ? undefined
            : safeAppHistoryUrl({ network: proposal.network, address: body });

    const executedHref =
        (settledReport != null
            ? safeAppTransactionUrl({
                  network: proposal.network,
                  address: body,
                  safeTxHash: settledReport.transaction.safeTxHash,
              })
            : undefined) ?? historyHref;

    /**
     * Provenance is a fact, not a control, so it renders as a link rather than a button. The date
     * carries the label; without one there is nothing to introduce, so the link stands alone and
     * says what it points at.
     */
    const executedAt = settledReport?.transaction.executionDate;
    const executedDate =
        executedAt == null
            ? undefined
            : formatterUtils.formatDate(executedAt, {
                  format: DateFormat.YEAR_MONTH_DAY,
              });

    const provenance =
        settledResultType != null && executedHref != null ? (
            <div className="mt-3 flex flex-row items-center gap-x-1 text-neutral-500 text-sm">
                {executedDate != null && (
                    <p>{t(`${translationKey}.executedLabel`)}</p>
                )}
                <Link
                    className="w-fit md:text-sm"
                    href={executedHref}
                    isExternal={true}
                    showUrl={false}
                >
                    {executedDate ?? t(`${translationKey}.executed`)}
                </Link>
            </div>
        ) : null;

    /**
     * An indexed verdict whose transaction was not recovered, and the absence is only worth
     * explaining once the scan actually reached an answer. A failed or still-running read has no
     * standing to say the report does not exist, so the copy keys off the outcome rather than off
     * a missing report: the history ran out without it, or this read's page budget did.
     */
    const isUnfound =
        settledResultType != null && settledReport == null && !isLoading;

    /**
     * A recovered report carries its own confirmations and the threshold that applied, but not the
     * owner count at that time - and today's owner count is the wrong denominator for history. So
     * a settled body states the counts in prose rather than drawing "N of today's owners", and
     * points at the Votes tab, which lists the signers from the same transaction.
     */
    const hasSettledCounts =
        settledReport != null && membersCount == null && !isLoading;

    if (settledReportOutcome === SafeSettledReportOutcome.SCAN_EXHAUSTED) {
        placeholderText = t(`${translationKey}.settledScanExhausted`);
    } else if (settledReportOutcome === SafeSettledReportOutcome.NOT_REPORTED) {
        placeholderText = t(`${translationKey}.settledNotReported`);
    }

    if (hasSettledCounts) {
        placeholderText = t(`${translationKey}.settledCounts`, {
            approvals: approvalsAmount,
            required: minApprovals,
        });
    }

    // `membersCount` is absent exactly when the body has settled, so it - not the two copy flags -
    // decides whether the bar can be drawn at all. The flags suppress themselves while loading, so
    // gating on them would let a settled body reach the bar with no denominator.
    if (safeInfo == null || membersCount == null || isUnfound) {
        return (
            <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
                {/* The skeleton animates itself, so the wrapper must not pulse too: nested pulses
                    multiply opacity and flicker. */}
                <div className="rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-4 shadow-neutral-sm md:px-6 md:py-6">
                    {placeholderText == null ? (
                        <div className="flex flex-col gap-2">
                            <StateSkeletonBar size="lg" width="40%" />
                            <StateSkeletonBar size="lg" width="70%" />
                        </div>
                    ) : (
                        <p className="text-neutral-500 text-sm md:text-base">
                            {placeholderText}
                        </p>
                    )}
                    {provenance}
                </div>
                {children}
            </Tabs.Content>
        );
    }

    return (
        <ProposalVoting.BreakdownMultisig
            approvalsAmount={approvalsAmount}
            isVeto={isVeto}
            membersCount={membersCount}
            minApprovals={minApprovals}
        >
            {children}
            {provenance}
        </ProposalVoting.BreakdownMultisig>
    );
};

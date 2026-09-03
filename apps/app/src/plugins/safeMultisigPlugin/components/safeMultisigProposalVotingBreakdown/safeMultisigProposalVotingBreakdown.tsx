'use client';

import {
    addressUtils,
    Link,
    ProposalStatus,
    ProposalVoting,
    ProposalVotingTab,
    Tabs,
    Tag,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import { SafeTransactionState } from '../../types';
import { SafeMultisigVoteList } from '../safeMultisigVoteList';

export interface ISafeMultisigProposalVotingBreakdownProps {
    proposal: ISppProposal;
    body: string;
    stage: ISppStage;
    isVeto?: boolean;
    children?: ReactNode;
}

const translationKey =
    'app.plugins.safeMultisig.safeMultisigProposalVotingBreakdown';

const resultTypeKey: Record<SppProposalType, string> = {
    [SppProposalType.NONE]: 'none',
    [SppProposalType.APPROVAL]: 'approval',
    [SppProposalType.VETO]: 'veto',
};

// Stage outcomes after which no report can land, so a live pending report is moot. ACCEPTED and
// ADVANCEABLE are deliberately absent: a veto body can still act inside the veto window.
const closedStageStatuses = [
    ProposalStatus.REJECTED,
    ProposalStatus.VETOED,
    ProposalStatus.UNREACHED,
    ProposalStatus.EXPIRED,
];

export const SafeMultisigProposalVotingBreakdown: React.FC<
    ISafeMultisigProposalVotingBreakdownProps
> = (props) => {
    const { proposal, body, stage, isVeto, children } = props;
    const { t } = useTranslations();

    const bodyState = useSafeMultisigBodyState({
        network: proposal.network,
        address: body,
        proposal,
        stage,
    });
    const {
        safeInfo,
        pendingReport,
        settledResultType,
        signers,
        hasConnectedWalletSigned,
        approvalsAmount,
        minApprovals,
        membersCount,
        isLoading,
        isError,
        isRateLimited,
        rateLimitedRetryAfter,
        isStale,
    } = bodyState;

    // A rate-limited read is a degraded state, not a bug: the poll backs off and recovers on its
    // own, so it must not read as a hard failure the user is expected to act on.
    let placeholderText = t(
        `${translationKey}.${isError ? 'error' : 'loading'}`,
    );

    if (isRateLimited) {
        placeholderText =
            rateLimitedRetryAfter == null
                ? t(`${translationKey}.rateLimited`)
                : t(`${translationKey}.rateLimitedRetry`, {
                      seconds: rateLimitedRetryAfter,
                  });
    }

    // The Votes tab is the body's per-owner signature list, and it renders its own loading, error
    // and empty states, so it is emitted in every branch rather than only alongside a readable Safe.
    const votesTab = (
        <ProposalVoting.Votes>
            <SafeMultisigVoteList
                isError={isError}
                isLoading={isLoading}
                isVeto={isVeto ?? false}
                network={proposal.network}
                signers={signers}
            />
        </ProposalVoting.Votes>
    );

    if (safeInfo == null) {
        return (
            <>
                {votesTab}
                <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
                    <div
                        className={classNames(
                            'rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-4 shadow-neutral-sm md:px-6 md:py-6',
                            isLoading && 'animate-pulse',
                        )}
                    >
                        <p className="text-neutral-500 text-sm md:text-base">
                            {placeholderText}
                        </p>
                    </div>
                    {children}
                </Tabs.Content>
            </>
        );
    }

    const isSuperseded =
        pendingReport?.state === SafeTransactionState.SUPERSEDED;
    const reportStateKey = isSuperseded ? 'superseded' : 'pending';
    const countParams = { count: approvalsAmount, required: minApprovals };

    // Once the stage is closed the queue can still hold a signed-but-unexecutable report. Calling it
    // "pending" invites a signature that can never take effect, so state the count that stopped
    // short instead. An executed result still wins: that is what actually happened.
    const isStageClosed = closedStageStatuses.includes(
        sppStageUtils.getStageStatus(proposal, stage),
    );

    let reportLabel: string;

    if (settledResultType != null) {
        reportLabel = t(
            `${translationKey}.report.${resultTypeKey[settledResultType]}.executed`,
        );
    } else if (isStageClosed) {
        reportLabel = t(
            `${translationKey}.report.notReached.${isVeto ? 'veto' : 'approval'}`,
            countParams,
        );
    } else if (pendingReport == null) {
        reportLabel = t(
            `${translationKey}.report.nonePending.${isVeto ? 'veto' : 'approval'}`,
        );
    } else {
        reportLabel = t(
            `${translationKey}.report.${resultTypeKey[pendingReport.report.resultType]}.${reportStateKey}`,
            countParams,
        );
    }

    return (
        <>
            {votesTab}
            <ProposalVoting.BreakdownMultisig
                approvalsAmount={approvalsAmount}
                isVeto={isVeto}
                membersCount={membersCount}
                minApprovals={minApprovals}
            >
                <div className="mt-4 flex flex-col gap-4 md:gap-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p
                            className={classNames(
                                'font-semibold text-base leading-tight md:text-lg',
                                isSuperseded
                                    ? 'text-neutral-500'
                                    : 'text-neutral-800',
                            )}
                        >
                            {reportLabel}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {isSuperseded && (
                                <Tag
                                    label={t(
                                        `${translationKey}.tag.superseded`,
                                    )}
                                    variant="neutral"
                                />
                            )}
                            {pendingReport?.hasNonceCompetition === true &&
                                !isStageClosed && (
                                    <Tag
                                        label={t(
                                            `${translationKey}.tag.competition`,
                                        )}
                                        variant="warning"
                                    />
                                )}
                            {isStale && (
                                <Tag
                                    label={t(`${translationKey}.tag.stale`)}
                                    variant="neutral"
                                />
                            )}
                            {hasConnectedWalletSigned && (
                                <Tag
                                    label={t(`${translationKey}.tag.youSigned`)}
                                    variant="success"
                                />
                            )}
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-neutral-100 border-t pt-4 md:grid-cols-3">
                        <div className="flex min-w-0 flex-col gap-1">
                            <dt className="text-neutral-500 text-sm">
                                {t(`${translationKey}.details.safeNonce`)}
                            </dt>
                            <dd className="truncate text-neutral-800 text-sm md:text-base">
                                {safeInfo.nonce}
                            </dd>
                        </div>
                        <div className="flex min-w-0 flex-col gap-1">
                            <dt className="text-neutral-500 text-sm">
                                {t(
                                    `${translationKey}.details.transactionNonce`,
                                )}
                            </dt>
                            <dd className="truncate text-neutral-800 text-sm md:text-base">
                                {pendingReport?.transaction.nonce ??
                                    t(`${translationKey}.details.unavailable`)}
                            </dd>
                        </div>
                        <div className="col-span-2 flex min-w-0 flex-col gap-1 md:col-span-1">
                            <dt className="text-neutral-500 text-sm">
                                {t(`${translationKey}.details.version`)}
                            </dt>
                            <dd className="truncate text-neutral-800 text-sm md:text-base">
                                {safeInfo.version ??
                                    t(`${translationKey}.details.unknown`)}
                            </dd>
                        </div>
                    </dl>

                    {isError && (
                        <p className="border-neutral-100 border-t pt-4 text-neutral-500 text-sm">
                            {t(`${translationKey}.partialError`)}
                        </p>
                    )}

                    <div className="border-neutral-100 border-t pt-4">
                        <Link
                            href={`/safe/${proposal.network}/${addressUtils.getChecksum(body)}`}
                        >
                            {t(`${translationKey}.viewSafeAccount`)}
                        </Link>
                    </div>
                </div>
                {children}
            </ProposalVoting.BreakdownMultisig>
        </>
    );
};

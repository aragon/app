'use client';

import {
    addressUtils,
    ProposalVoting,
    ProposalVotingTab,
    Tabs,
    Tag,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import { SafeTransactionState } from '../../types';

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
    } = bodyState;

    if (safeInfo == null) {
        return (
            <Tabs.Content value={ProposalVotingTab.BREAKDOWN}>
                <div
                    className={classNames(
                        'rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-4 shadow-neutral-sm md:px-6 md:py-6',
                        isLoading && 'animate-pulse',
                    )}
                >
                    <p className="text-neutral-500 text-sm md:text-base">
                        {t(
                            `${translationKey}.${isError ? 'error' : 'loading'}`,
                        )}
                    </p>
                </div>
                {children}
            </Tabs.Content>
        );
    }

    const isSuperseded =
        pendingReport?.state === SafeTransactionState.SUPERSEDED;
    const reportStateKey = isSuperseded ? 'superseded' : 'pending';
    const reportLabel =
        settledResultType != null
            ? t(
                  `${translationKey}.report.${resultTypeKey[settledResultType]}.executed`,
              )
            : pendingReport == null
              ? t(
                    `${translationKey}.report.nonePending.${isVeto ? 'veto' : 'approval'}`,
                )
              : t(
                    `${translationKey}.report.${resultTypeKey[pendingReport.report.resultType]}.${reportStateKey}`,
                    {
                        count: approvalsAmount,
                        required: minApprovals,
                    },
                );

    return (
        <ProposalVoting.BreakdownMultisig
            approvalsAmount={approvalsAmount}
            isVeto={isVeto}
            membersCount={membersCount}
            minApprovals={minApprovals}
        >
            <div className="flex flex-col gap-4 md:gap-5">
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
                                label={t(`${translationKey}.tag.superseded`)}
                                variant="neutral"
                            />
                        )}
                        {pendingReport?.hasNonceCompetition === true && (
                            <Tag
                                label={t(`${translationKey}.tag.competition`)}
                                variant="warning"
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
                            {t(`${translationKey}.details.transactionNonce`)}
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

                {pendingReport != null && (
                    <div className="flex flex-col gap-2 border-neutral-100 border-t pt-4">
                        <p className="font-semibold text-neutral-800 text-sm md:text-base">
                            {t(`${translationKey}.signers.title`, {
                                count: signers.length,
                            })}
                        </p>
                        {signers.length === 0 ? (
                            <p className="text-neutral-500 text-sm">
                                {t(`${translationKey}.signers.empty`)}
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-2 md:grid md:grid-cols-2">
                                {signers.map((signer) => (
                                    <li
                                        className="truncate rounded-lg bg-neutral-50 px-3 py-2 text-neutral-700 text-sm"
                                        key={signer}
                                        title={signer}
                                    >
                                        {addressUtils.truncateAddress(signer)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {isError && (
                    <p className="border-neutral-100 border-t pt-4 text-neutral-500 text-sm">
                        {t(`${translationKey}.partialError`)}
                    </p>
                )}
            </div>
            {children}
        </ProposalVoting.BreakdownMultisig>
    );
};

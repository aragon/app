'use client';

import {
    addressUtils,
    formatterUtils,
    NumberFormat,
    Progress,
    ProposalStatus,
} from '@aragon/gov-ui-kit';
import { useEnsName } from '@/modules/ens';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { sppStageUtils } from '@/plugins/sppPlugin/utils/sppStageUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';
import { SafeTransactionState } from '../../types';
import type { ISafeMultisigProposalVotingSummaryProps } from './safeMultisigProposalVotingSummary.api';

const translationKey =
    'app.plugins.safeMultisig.safeMultisigProposalVotingSummary';

export const SafeMultisigProposalVotingSummary: React.FC<
    ISafeMultisigProposalVotingSummaryProps
> = (props) => {
    const { proposal, body, stage, isVeto } = props;

    const { t } = useTranslations();
    const { data: ensName } = useEnsName(body);

    const {
        safeInfo,
        pendingReport,
        settledResultType,
        approvalsAmount,
        minApprovals,
        membersCount,
    } = useSafeMultisigBodyState({
        network: proposal.network,
        address: body,
        proposal,
        stage,
    });

    // A Safe has no name onchain, so the body reads as its ENS name or address, exactly as the
    // generic external body it replaces did.
    const displayName = ensName ?? addressUtils.truncateAddress(body);
    const stageStatus = sppStageUtils.getStageStatus(proposal, stage);

    // Before the stage opens there is nothing to count, and a failed read must not be dressed up as
    // zero approvals: name the body and say no more.
    if (stageStatus === ProposalStatus.PENDING || safeInfo == null) {
        return (
            <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                {displayName}
            </p>
        );
    }

    const isSettled =
        settledResultType != null || stageStatus !== ProposalStatus.ACTIVE;

    if (isSettled) {
        const reached =
            settledResultType === SppProposalType.APPROVAL ||
            settledResultType === SppProposalType.VETO;
        const wasReplaced =
            settledResultType == null &&
            pendingReport?.state === SafeTransactionState.SUPERSEDED;

        let statusKey: string;

        if (reached) {
            statusKey = isVeto ? 'vetoed' : 'approved';
        } else if (wasReplaced) {
            statusKey = 'replaced';
        } else {
            statusKey = isVeto ? 'notVetoed' : 'notApproved';
        }

        const statusClass =
            reached && isVeto
                ? 'text-critical-800'
                : reached
                  ? 'text-success-800'
                  : 'text-neutral-500';

        return (
            <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                {displayName}{' '}
                <span className={statusClass}>
                    {t(`${translationKey}.${statusKey}`)}
                </span>
            </p>
        );
    }

    // Owners are read live and a Safe can be emptied, so guard the division rather than trusting a
    // positive member count the way a snapshotted body can.
    const approvalsPercentage =
        membersCount > 0 ? (approvalsAmount / membersCount) * 100 : 0;
    const thresholdPercentage =
        membersCount > 0 ? (minApprovals / membersCount) * 100 : 0;
    const isThresholdReached = approvalsAmount >= minApprovals;

    return (
        <div className="flex w-full flex-col gap-3">
            <p className="font-normal text-base text-neutral-800 leading-tight md:text-lg">
                {displayName}{' '}
                <span className="text-neutral-500">
                    {t(
                        `${translationKey}.${isVeto ? 'vetoLabel' : 'approvalLabel'}`,
                    )}
                </span>
            </p>
            <Progress
                thresholdIndicator={thresholdPercentage}
                value={approvalsPercentage}
                variant={isThresholdReached ? 'primary' : 'neutral'}
            />
            <p className="font-normal text-neutral-800 text-sm leading-tight md:text-base">
                {formatterUtils.formatNumber(approvalsAmount, {
                    format: NumberFormat.GENERIC_SHORT,
                })}{' '}
                <span className="text-neutral-500">
                    {t(`${translationKey}.ownerCount`, {
                        count: formatterUtils.formatNumber(membersCount, {
                            format: NumberFormat.GENERIC_SHORT,
                        })!,
                    })}
                </span>
            </p>
        </div>
    );
};

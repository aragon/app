'use client';

import {
    Button,
    IconType,
    ProposalVoting,
    ProposalVotingTab,
    Tabs,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { safeAppHistoryUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import type { ISppProposal, ISppStage } from '@/plugins/sppPlugin/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useSafeMultisigBodyState } from '../../hooks/useSafeMultisigBodyState';

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
    } = useSafeMultisigBodyState({
        network: proposal.network,
        address: body,
        proposal,
        stage,
    });

    // A rate-limited read is a degraded state, not a bug: the poll backs off and recovers on its
    // own, so it must not read as the generic hard failure the user is expected to act on.
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
                        {placeholderText}
                    </p>
                </div>
                {children}
            </Tabs.Content>
        );
    }

    // Once the body has reported, the action slot is gone - the shared chrome stops rendering it as
    // soon as the proposal executes - so the provenance lives here, where the body always renders.
    const historyHref = safeAppHistoryUrl({
        network: proposal.network,
        address: body,
    });

    return (
        <ProposalVoting.BreakdownMultisig
            approvalsAmount={approvalsAmount}
            isVeto={isVeto}
            membersCount={membersCount}
            minApprovals={minApprovals}
        >
            {children}
            {settledResultType != null && historyHref != null && (
                <Button
                    className="w-fit"
                    href={historyHref}
                    iconRight={IconType.LINK_EXTERNAL}
                    rel="noopener"
                    size="md"
                    target="_blank"
                    variant="success"
                >
                    {t(`${translationKey}.executed`)}
                </Button>
            )}
        </ProposalVoting.BreakdownMultisig>
    );
};

'use client';

import { Button } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Link from 'next/link';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { FlowPolicyChart } from '../../components/flowPolicyChart/flowPolicyChart';
import { FlowPolicyHistory } from '../../components/flowPolicyHistory/flowPolicyHistory';
import { FlowPolicyStructure } from '../../components/flowPolicyStructure/flowPolicyStructure';
import {
    FlowStatusDot,
    FlowStrategyChip,
    FlowTokenChip,
    FlowWaitingForIndexerBadge,
} from '../../components/flowPrimitives';
import { FlowRecipientsTable } from '../../components/flowRecipientsTable/flowRecipientsTable';
import { FlowDialogId } from '../../constants/flowDialogId';
import type { IConfirmDispatchDialogParams } from '../../dialogs/confirmDispatchDialog';
import { useFlowDataContext } from '../../providers/flowDataProvider';
import type { IFlowPolicy } from '../../types';
import {
    formatFlowAmount,
    formatRelative,
    formatShortDate,
    isDispatchableStrategy,
} from '../../utils/flowFormatters';

export interface IFlowPolicyDetailPageClientProps {
    network: string;
    addressOrEns: string;
    policyId: string;
}

export const FlowPolicyDetailPageClient: React.FC<
    IFlowPolicyDetailPageClientProps
> = (props) => {
    const { network, addressOrEns, policyId } = props;
    const { data, dispatchPolicy, getPendingDispatch, isEnvioLoading } =
        useFlowDataContext();
    const { open } = useDialogContext();
    const decodedPolicyId = decodeURIComponent(policyId);
    const policy = data.policies.find(
        (p) => p.id === decodedPolicyId || p.id === policyId,
    );
    const base = `/dao/${network}/${addressOrEns}/flow`;

    if (policy == null) {
        if (isEnvioLoading) {
            return (
                <div className="flex flex-col gap-4">
                    <div className="h-8 w-64 animate-pulse rounded-md bg-neutral-100" />
                    <div className="h-40 animate-pulse rounded-xl bg-neutral-50" />
                    <div className="h-64 animate-pulse rounded-xl bg-neutral-50" />
                </div>
            );
        }
        return (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-6">
                <h1 className="font-semibold text-neutral-800 text-xl leading-tight">
                    Policy not found
                </h1>
                <p className="font-normal text-neutral-500 text-sm leading-relaxed">
                    No policy with id <code>{decodedPolicyId}</code> is
                    installed on this DAO.
                </p>
                <Link
                    className="font-normal text-primary-400 text-sm leading-tight hover:text-primary-600"
                    href={base}
                >
                    ← Back to Flow overview
                </Link>
            </div>
        );
    }

    const handleDispatchClick = () => {
        const params: IConfirmDispatchDialogParams = {
            policy,
            onConfirm: () => dispatchPolicy(policy.id),
        };
        open(FlowDialogId.CONFIRM_DISPATCH, { params });
    };

    const dispatchable =
        isDispatchableStrategy(policy.strategy) && policy.status !== 'paused';
    const pendingDispatch = getPendingDispatch(policy.id);
    const isDispatching = pendingDispatch != null;
    // Mirrors FlowPolicyCard: we allow manual dispatch for every non-claimer,
    // non-archived router regardless of whether it's already "live" — the only
    // hard gates are a live cooldown and an in-flight tx we haven't confirmed.
    const cooldownActive =
        policy.status === 'cooldown' &&
        policy.cooldown != null &&
        new Date(policy.cooldown.readyAt).getTime() > Date.now();
    const dispatchDisabled = cooldownActive || isDispatching;
    const dispatchLabel = isDispatching
        ? 'Dispatching…'
        : policy.pending != null
          ? `Dispatch now · ${formatFlowAmount(policy.pending.amount, policy.pending.token)} ${policy.pending.token}`
          : 'Dispatch now';

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="font-semibold text-2xl text-neutral-800 leading-tight md:text-3xl">
                                {policy.name}
                            </h1>
                            <FlowStrategyChip strategy={policy.strategy} />
                            <FlowTokenChip token={policy.token} />
                        </div>
                        <p className="font-normal text-base text-neutral-500 leading-relaxed">
                            {policy.description}
                        </p>
                        {/* Keep the metadata row focused: current status, when
                         * the policy was installed (and via which proposal),
                         * and the edit link. Full lifecycle lives in the
                         * `FlowPolicyHistory` section below, so no compact
                         * ribbon here. */}
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge policy={policy} />
                            <InstalledViaPill
                                addressOrEns={addressOrEns}
                                network={network}
                                policy={policy}
                            />
                            <Link
                                aria-label={`Edit ${policy.name} in DAO settings`}
                                className="inline-flex items-center gap-1 rounded-full border border-neutral-100 px-2 py-0.5 font-normal text-neutral-600 text-xs leading-tight hover:border-primary-200 hover:text-primary-500"
                                href={`/dao/${network}/${addressOrEns}/settings/automations/${policy.address}`}
                                rel="noopener"
                                target="_blank"
                            >
                                Edit ↗
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {policy.status === 'paused' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-100 px-3 py-1.5 font-semibold text-sm text-warning-800 leading-tight">
                                {policy.uninstalledAt
                                    ? `Archived · uninstalled ${formatRelative(policy.uninstalledAt)}`
                                    : 'Archived · uninstalled'}
                            </span>
                        ) : dispatchable ? (
                            <>
                                <Button
                                    disabled={dispatchDisabled}
                                    onClick={handleDispatchClick}
                                    size="md"
                                    variant={
                                        dispatchDisabled
                                            ? 'tertiary'
                                            : 'primary'
                                    }
                                >
                                    {dispatchLabel}
                                </Button>
                                <span className="max-w-[220px] text-right font-normal text-neutral-500 text-xs leading-snug">
                                    {dispatchDisabled
                                        ? dispatchDisabledReason(policy)
                                        : 'Dispatches the pending amount to all recipients.'}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1.5 font-semibold text-sm text-success-800 leading-tight">
                                    {policy.pending != null
                                        ? `${formatFlowAmount(policy.pending.amount, policy.pending.token)} ${policy.pending.token} claimable`
                                        : 'Claim window open'}
                                </span>
                                <span className="max-w-[220px] text-right font-normal text-neutral-500 text-xs leading-snug">
                                    Pull-based policy — recipients claim
                                    directly, no manual dispatch required.
                                </span>
                            </>
                        )}
                    </div>
                </div>
                {pendingDispatch != null && (
                    <FlowWaitingForIndexerBadge
                        network={network}
                        pending={pendingDispatch}
                        variant="block"
                    />
                )}
            </header>

            <FlowPolicyChart
                addressOrEns={addressOrEns}
                network={network}
                policy={policy}
            />
            <FlowPolicyStructure policy={policy} />
            <FlowRecipientsTable data={data} policy={policy} variant="policy" />
            <FlowPolicyHistory policy={policy} />
        </div>
    );
};

const dispatchDisabledReason = (policy: IFlowPolicy): string => {
    if (policy.status === 'cooldown') {
        return `Cooldown · ready ${policy.cooldown != null ? formatRelative(policy.cooldown.readyAt) : ''}.`;
    }
    if (policy.status === 'paused') {
        return 'Paused for review. Resume via a governance proposal.';
    }
    if (policy.status === 'awaiting') {
        return 'Awaiting activation proposal.';
    }
    return policy.nextDispatchLabel;
};

const StatusBadge: React.FC<{ policy: IFlowPolicy }> = ({ policy }) => {
    const toneByStatus: Record<string, string> = {
        ready: 'bg-primary-100 text-primary-800',
        live: 'bg-success-100 text-success-800',
        cooldown: 'bg-warning-100 text-warning-800',
        awaiting: 'bg-neutral-100 text-neutral-700',
        paused: 'bg-warning-100 text-warning-800',
        never: 'bg-neutral-100 text-neutral-500',
    };
    return (
        <span
            className={classNames(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold text-xs leading-tight',
                toneByStatus[policy.status],
            )}
        >
            <FlowStatusDot status={policy.status} />
            {policy.statusLabel}
        </span>
    );
};

/**
 * "Installed {date} via {proposal}" chip. Uses the proposal title when the
 * REST join resolved it, otherwise falls back to the shorter slug / id (or a
 * plain "Installed {date}" when we have no attribution at all). Linkified
 * whenever we know the proposal slug so the user can jump to it.
 */
const InstalledViaPill: React.FC<{
    policy: IFlowPolicy;
    network: string;
    addressOrEns: string;
}> = ({ policy, network, addressOrEns }) => {
    const proposalLabel =
        policy.installedViaProposalTitle ??
        (policy.installedViaProposal !== '—'
            ? policy.installedViaProposal
            : undefined);
    const proposalHref = policy.installedViaProposalSlug
        ? `/dao/${network}/${addressOrEns}/proposals/${policy.installedViaProposalSlug}`
        : null;

    if (proposalHref) {
        return (
            <Link
                className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 font-normal text-primary-700 text-xs leading-tight hover:bg-primary-100"
                href={proposalHref}
                title={
                    proposalLabel
                        ? `Installed ${formatShortDate(policy.createdAt)} via ${proposalLabel}`
                        : undefined
                }
            >
                Installed {formatShortDate(policy.createdAt)}
                {proposalLabel ? <> · {proposalLabel} →</> : <> →</>}
            </Link>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 font-normal text-neutral-700 text-xs leading-tight">
            Installed {formatShortDate(policy.createdAt)}
            {proposalLabel ? ` · ${proposalLabel}` : ''}
        </span>
    );
};

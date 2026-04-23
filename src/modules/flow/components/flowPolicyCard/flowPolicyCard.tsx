'use client';

import { Button } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { FlowDialogId } from '../../constants/flowDialogId';
import type { IConfirmDispatchDialogParams } from '../../dialogs/confirmDispatchDialog';
import { useFlowDataContext } from '../../providers/flowDataProvider';
import type { FlowPolicyStatus, IFlowPolicy } from '../../types';
import {
    formatFlowAmount,
    formatFlowAmountWithToken,
    formatRelative,
    isDispatchableStrategy,
} from '../../utils/flowFormatters';
import {
    FlowAddressLabel,
    FlowBlockieAvatar,
    FlowStatusDot,
    FlowStrategyChip,
    FlowTokenChip,
    FlowWaitingForIndexerBadge,
} from '../flowPrimitives';
import { FlowSparkline } from '../flowSparkline/flowSparkline';

export interface IFlowPolicyCardProps {
    policy: IFlowPolicy;
    network: string;
    addressOrEns: string;
    /**
     * Density variant:
     * - `default` (Active pill): full card with sparkline + recipients strip.
     * - `compact` (Not-yet-dispatched / Archived pills): hides sparkline and the
     *   totals row since there's no meaningful history to show.
     */
    variant?: 'default' | 'compact';
    className?: string;
}

const cardStatusBorder: Record<FlowPolicyStatus, string> = {
    ready: 'border-primary-200',
    live: 'border-success-200',
    cooldown: 'border-warning-200',
    awaiting: 'border-neutral-200',
    paused: 'border-warning-300',
    never: 'border-neutral-100',
};

export const FlowPolicyCard: React.FC<IFlowPolicyCardProps> = (props) => {
    const {
        policy,
        network,
        addressOrEns,
        variant = 'default',
        className,
    } = props;
    const href = `/dao/${network}/${addressOrEns}/flow/policies/${policy.id}`;
    const editHref = `/dao/${network}/${addressOrEns}/settings/automations/${policy.address}`;
    const isCompact = variant === 'compact';

    const router = useRouter();
    const { open } = useDialogContext();
    const { dispatchPolicy, getPendingDispatch } = useFlowDataContext();
    const pendingDispatch = getPendingDispatch(policy.id);

    const handleNavigate = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, a')) {
            return;
        }
        router.push(href);
    };

    const handleDispatchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const params: IConfirmDispatchDialogParams = {
            policy,
            onConfirm: () => dispatchPolicy(policy.id),
        };
        open(FlowDialogId.CONFIRM_DISPATCH, { params });
    };

    return (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: card is a composite interactive surface, keyboard reachable via the title link and action buttons
        <article
            // `h-full` + `mt-auto` on the footer ensures every card in a row ends with its
            // CTA button aligned to the bottom regardless of how many recipients / lines
            // of copy appear in the middle — so the grid of cards reads as a clean row.
            className={classNames(
                'group flex h-full cursor-pointer flex-col gap-4 rounded-xl border bg-neutral-0 p-5 shadow-neutral-sm transition-all focus-within:outline focus-within:outline-2 focus-within:outline-primary-400 hover:shadow-neutral',
                cardStatusBorder[policy.status],
                className,
            )}
            onClick={handleNavigate}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const target = e.target as HTMLElement;
                    if (!target.closest('button, a')) {
                        e.preventDefault();
                        router.push(href);
                    }
                }
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <FlowStatusDot status={policy.status} />
                        <Link
                            className="truncate font-semibold text-base text-neutral-800 leading-tight hover:text-primary-400"
                            href={href}
                        >
                            {policy.name}
                        </Link>
                        {policy.failedLastDispatch != null && (
                            <span className="inline-flex items-center rounded-full bg-critical-100 px-2 py-0.5 font-semibold text-[10px] text-critical-800 uppercase leading-tight tracking-wide">
                                Failed
                            </span>
                        )}
                    </div>
                    <p className="font-normal text-neutral-500 text-sm leading-snug">
                        {policy.description}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    {policy.swapPair ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-neutral-100 bg-neutral-0 px-2 py-0.5 font-normal text-neutral-800 text-sm leading-tight">
                            <FlowTokenChip
                                className="border-0 px-1 py-0"
                                token={policy.swapPair.in}
                            />
                            <span
                                aria-hidden={true}
                                className="text-neutral-400"
                            >
                                →
                            </span>
                            <FlowTokenChip
                                className="border-0 px-1 py-0"
                                token={policy.swapPair.out}
                            />
                        </span>
                    ) : (
                        <FlowTokenChip token={policy.token} />
                    )}
                    <FlowStrategyChip strategy={policy.strategy} />
                    <Link
                        aria-label={`Edit ${policy.name} in DAO settings`}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-100 px-2 py-0.5 font-normal text-neutral-500 text-xs leading-tight hover:border-primary-200 hover:text-primary-400"
                        href={editHref}
                        onClick={(e) => e.stopPropagation()}
                        rel="noopener"
                        target="_blank"
                    >
                        Edit ↗
                    </Link>
                </div>
            </div>

            {!isCompact && (
                <FlowSparkline
                    dispatches={policy.dispatches}
                    events={policy.events}
                    installedAt={policy.createdAt}
                    token={policy.token}
                />
            )}

            <div className="flex items-end justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-semibold text-neutral-800 text-xl tabular-nums leading-tight">
                        {formatFlowAmountWithToken(
                            policy.totalDistributed,
                            policy.token,
                        )}
                    </span>
                    <span className="font-normal text-neutral-500 text-sm leading-tight">
                        Total since install
                    </span>
                    {policy.lastDispatch != null && (
                        <span className="font-normal text-neutral-500 text-sm leading-tight">
                            Last:{' '}
                            <span className="text-neutral-700">
                                {formatFlowAmount(
                                    policy.lastDispatch.amount,
                                    policy.lastDispatch.token,
                                )}{' '}
                                {policy.lastDispatch.token}
                            </span>{' '}
                            · {formatRelative(policy.lastDispatch.at)}
                        </span>
                    )}
                </div>
                {policy.pending != null && (
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="font-normal text-neutral-500 text-xs uppercase leading-tight tracking-wide">
                            {isDispatchableStrategy(policy.strategy)
                                ? 'Pending'
                                : 'Claimable'}
                        </span>
                        <span className="font-semibold text-lg text-neutral-800 tabular-nums leading-tight">
                            {formatFlowAmount(
                                policy.pending.amount,
                                policy.pending.token,
                            )}{' '}
                            {policy.pending.token}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1.5 border-neutral-100 border-t pt-3">
                {policy.recipients.slice(0, 3).map((recipient) => (
                    <div
                        className="flex items-center gap-2"
                        key={recipient.address}
                    >
                        <FlowBlockieAvatar
                            address={recipient.address}
                            size={20}
                        />
                        <FlowAddressLabel
                            address={recipient.address}
                            className="min-w-0 flex-1"
                            knownEns={recipient.ens}
                            knownLabel={
                                recipient.role != null
                                    ? recipient.name
                                    : undefined
                            }
                            knownRole={recipient.role}
                            showSubtitle={false}
                        />
                        {recipient.pct != null && (
                            <span className="font-normal text-neutral-500 text-sm tabular-nums leading-tight">
                                {recipient.pct}%
                            </span>
                        )}
                    </div>
                ))}
                {policy.recipientsMore > 0 && (
                    <span className="font-normal text-neutral-500 text-xs leading-tight">
                        +{policy.recipientsMore} more · {policy.recipientGroup}
                    </span>
                )}
            </div>

            {/* `mt-auto` on this group pins the badge + CTA to the bottom of the card
                so cards of different content heights share a common baseline in the grid. */}
            <div className="mt-auto flex flex-col gap-4">
                {pendingDispatch != null && (
                    <FlowWaitingForIndexerBadge
                        network={network}
                        pending={pendingDispatch}
                        variant="block"
                    />
                )}

                <PolicyCardFooter
                    href={href}
                    isDispatching={pendingDispatch != null}
                    onDispatch={handleDispatchClick}
                    policy={policy}
                />
            </div>
        </article>
    );
};

interface IPolicyCardFooterProps {
    policy: IFlowPolicy;
    href: string;
    onDispatch: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * `true` while a dispatch tx has been broadcast but the indexer hasn't surfaced
     * it yet — the dispatch button is disabled to prevent double-submits and a
     * helper caption is shown instead of the usual CTA label.
     */
    isDispatching?: boolean;
}

const PolicyCardFooter: React.FC<IPolicyCardFooterProps> = (props) => {
    const { policy, onDispatch, isDispatching = false } = props;

    // Archived policies never dispatch again — show an uninstall chip instead.
    if (policy.status === 'paused') {
        const uninstalledLabel = policy.uninstalledAt
            ? `Archived · uninstalled ${formatRelative(policy.uninstalledAt)}`
            : 'Archived · uninstalled';
        return <FooterChip tone="warning">{uninstalledLabel}</FooterChip>;
    }

    // Pull-based strategies (Claimer) can't be pushed from the UI.
    if (!isDispatchableStrategy(policy.strategy)) {
        return (
            <FooterChip tone="success">
                {policy.statusLabel || 'Open for claims'}
            </FooterChip>
        );
    }

    // Every other strategy gets a Dispatch button. When a cooldown is active the button is
    // disabled and the ring inside `CooldownFooter` tells the operator when to come back.
    const cooldownActive =
        policy.status === 'cooldown' &&
        policy.cooldown != null &&
        new Date(policy.cooldown.readyAt).getTime() > Date.now();

    const pending = policy.pending;
    const dispatchLabel = pending
        ? `Dispatch now · ${formatFlowAmount(pending.amount, pending.token)} ${pending.token}`
        : 'Dispatch now';

    const buttonLabel = isDispatching ? 'Dispatching…' : dispatchLabel;

    return (
        <div className="flex flex-col gap-2">
            <Button
                className="w-full"
                disabled={cooldownActive || isDispatching}
                onClick={onDispatch}
                size="md"
                variant="primary"
            >
                {buttonLabel}
            </Button>
            {cooldownActive && policy.cooldown != null && (
                <CooldownFooter cooldown={policy.cooldown} />
            )}
            {policy.status === 'never' && !cooldownActive && (
                <span className="text-center font-normal text-neutral-500 text-xs leading-snug">
                    Not yet dispatched — the first run will seed the chart.
                </span>
            )}
            {policy.failedLastDispatch != null && (
                <span className="font-normal text-critical-700 text-xs leading-snug">
                    Last attempt failed · {policy.failedLastDispatch.reason}
                </span>
            )}
        </div>
    );
};

const CooldownFooter: React.FC<{
    cooldown: NonNullable<IFlowPolicy['cooldown']>;
}> = ({ cooldown }) => {
    const readyAtMs = new Date(cooldown.readyAt).getTime();

    // Progress depends on `Date.now()`, which differs between server render
    // and client hydration. Start with `null` to render a neutral state on the
    // server and fill it in after mount so SSR HTML matches the first client
    // render, then tick every second to animate the cooldown ring.
    const [now, setNow] = useState<number | null>(null);

    useEffect(() => {
        setNow(Date.now());
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const progress =
        now == null
            ? 0
            : Math.min(
                  Math.max(
                      1 - Math.max(readyAtMs - now, 0) / cooldown.totalMs,
                      0,
                  ),
                  1,
              );
    const radius = 12;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="flex items-center gap-3 rounded-full bg-neutral-50 px-3 py-2">
            <svg aria-hidden={true} height={32} width={32}>
                <title>Cooldown progress</title>
                <circle
                    cx={16}
                    cy={16}
                    fill="none"
                    r={radius}
                    stroke="#e5e7eb"
                    strokeWidth={3}
                />
                <circle
                    cx={16}
                    cy={16}
                    fill="none"
                    r={radius}
                    stroke="#d97706"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress)}
                    strokeLinecap="round"
                    strokeWidth={3}
                    transform="rotate(-90 16 16)"
                />
            </svg>
            <div className="flex flex-col leading-tight">
                <span className="font-semibold text-neutral-800 text-sm">
                    Ready {formatRelative(cooldown.readyAt)}
                </span>
                <span className="font-normal text-neutral-500 text-xs">
                    {Math.round(progress * 100)}% of cooldown elapsed
                </span>
            </div>
        </div>
    );
};

const FooterChip: React.FC<{
    tone: 'success' | 'warning' | 'neutral';
    children: React.ReactNode;
}> = ({ tone, children }) => {
    const toneClass = {
        success: 'bg-success-100 text-success-800',
        warning: 'bg-warning-100 text-warning-800',
        neutral: 'bg-neutral-100 text-neutral-700',
    }[tone];
    return (
        <span
            className={classNames(
                'inline-flex w-full items-center justify-center rounded-full px-3 py-1.5 font-semibold text-sm leading-tight',
                toneClass,
            )}
        >
            {children}
        </span>
    );
};

'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type {
    FlowEventKind,
    FlowPolicyStrategy,
    FlowTokenSymbol,
    IFlowDaoData,
    IFlowPolicy,
} from '../../types';
import {
    formatFlowAmount,
    formatRelative,
    formatShortDate,
} from '../../utils/flowFormatters';
import { FlowStrategyChip, FlowTokenChip } from '../flowPrimitives';

export type FlowActivityVariant = 'preview' | 'full';

export interface IFlowActivityFeedProps {
    data: IFlowDaoData;
    network: string;
    addressOrEns: string;
    variant?: FlowActivityVariant;
    limit?: number;
    policyId?: string;
    className?: string;
}

type ActivityRowType = 'dispatch' | FlowEventKind;

interface IActivityRow {
    id: string;
    timestamp: number;
    at: string;
    type: ActivityRowType;
    typeLabel: string;
    policyId: string;
    policyName: string;
    token?: FlowTokenSymbol;
    tokenIn?: FlowTokenSymbol;
    amountIn?: number;
    tokenOut?: FlowTokenSymbol;
    amountOut?: number;
    strategy?: FlowPolicyStrategy;
    amount?: number;
    recipientLabel?: string;
    txHash?: string;
    description?: string;
    proposalId?: string;
    proposalSlug?: string;
}

const eventTypeLabel: Record<FlowEventKind, string> = {
    policyInstalled: 'Installed',
    policyUninstalled: 'Uninstalled',
    paused: 'Paused',
    resumed: 'Resumed',
    settingsUpdated: 'Settings',
    proposalApplied: 'Proposal',
    recipientsUpdated: 'Recipients',
    dispatchFailed: 'Failed dispatch',
};

const shortTx = (hash: string): string =>
    hash.length > 14 ? `${hash.slice(0, 10)}…${hash.slice(-4)}` : hash;

const buildRecipientLabel = (
    policy: IFlowPolicy,
    dispatch: IFlowPolicy['dispatches'][number],
): string => {
    if (dispatch.recipientsCount === 0) {
        return 'No recipients yet';
    }
    if (dispatch.recipientsCount === 1) {
        const top = dispatch.topRecipients[0];
        if (top) {
            return top.name;
        }
        const fallback = policy.recipients[0];
        return fallback?.name ?? 'single recipient';
    }
    return `${dispatch.recipientsCount} recipients`;
};

const buildRows = (data: IFlowDaoData, policyId?: string): IActivityRow[] => {
    const rows: IActivityRow[] = [];
    for (const policy of data.policies) {
        if (policyId != null && policy.id !== policyId) {
            continue;
        }
        for (const dispatch of policy.dispatches) {
            rows.push({
                id: `d-${dispatch.id}`,
                timestamp: new Date(dispatch.at).getTime(),
                at: dispatch.at,
                type: 'dispatch',
                typeLabel: policy.verb,
                policyId: policy.id,
                policyName: policy.name,
                token: dispatch.token,
                tokenIn: dispatch.tokenIn,
                amountIn: dispatch.amountIn,
                tokenOut: dispatch.tokenOut,
                amountOut: dispatch.amountOut,
                strategy: policy.strategy,
                amount: dispatch.amount,
                recipientLabel: buildRecipientLabel(policy, dispatch),
                txHash: dispatch.txHash,
                proposalId: dispatch.proposalId,
                proposalSlug: dispatch.proposalSlug,
            });
        }
        for (const event of policy.events) {
            rows.push({
                id: `e-${event.id}`,
                timestamp: new Date(event.at).getTime(),
                at: event.at,
                type: event.kind,
                typeLabel: eventTypeLabel[event.kind] ?? 'Event',
                policyId: policy.id,
                policyName: policy.name,
                strategy: policy.strategy,
                description: event.description,
                proposalId: event.proposalId,
                proposalSlug: event.proposalSlug,
                txHash: event.txHash,
            });
        }
    }
    return rows.sort((a, b) => b.timestamp - a.timestamp);
};

// Shared grid template: time · type · policy · detail · context · tx
const ROW_GRID =
    'grid items-center gap-x-4 gap-y-1 md:grid-cols-[80px_100px_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_120px]';

export const FlowActivityFeed: React.FC<IFlowActivityFeedProps> = (props) => {
    const {
        data,
        network,
        addressOrEns,
        variant = 'full',
        limit,
        policyId,
        className,
    } = props;

    const allRows = useMemo(() => buildRows(data, policyId), [data, policyId]);

    const [policyFilter, setPolicyFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const rows = useMemo(() => {
        if (variant === 'preview') {
            return allRows.slice(0, limit ?? 6);
        }
        return allRows.filter((row) => {
            if (policyFilter !== 'all' && row.policyId !== policyFilter) {
                return false;
            }
            if (typeFilter !== 'all') {
                if (typeFilter === 'dispatch' && row.type !== 'dispatch') {
                    return false;
                }
                if (typeFilter === 'event' && row.type === 'dispatch') {
                    return false;
                }
            }
            return true;
        });
    }, [allRows, variant, limit, policyFilter, typeFilter]);

    return (
        <section
            className={classNames(
                'flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:p-6',
                className,
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-lg text-neutral-800 leading-tight">
                    {variant === 'preview' ? 'Recent activity' : 'Activity'}
                </h2>
                {variant === 'preview' ? (
                    <Link
                        className="font-normal text-primary-400 text-sm leading-tight hover:text-primary-600"
                        href={`/dao/${network}/${addressOrEns}/flow/activity`}
                    >
                        View all →
                    </Link>
                ) : (
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            className="rounded-md border border-neutral-100 bg-neutral-0 px-2 py-1 text-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                            onChange={(e) => setPolicyFilter(e.target.value)}
                            value={policyFilter}
                        >
                            <option value="all">All policies</option>
                            {data.policies.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="rounded-md border border-neutral-100 bg-neutral-0 px-2 py-1 text-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                            onChange={(e) => setTypeFilter(e.target.value)}
                            value={typeFilter}
                        >
                            <option value="all">All types</option>
                            <option value="dispatch">Dispatches</option>
                            <option value="event">Events</option>
                        </select>
                    </div>
                )}
            </div>

            <ul className="flex flex-col divide-y divide-neutral-100">
                {rows.map((row) => (
                    <li className={classNames(ROW_GRID, 'py-3')} key={row.id}>
                        <span className="font-normal text-neutral-500 text-sm tabular-nums leading-tight">
                            {formatRelative(row.at)}
                        </span>
                        <span className="font-semibold text-neutral-700 text-sm uppercase leading-tight tracking-wide">
                            {row.typeLabel}
                        </span>
                        <Link
                            className="min-w-0 truncate font-normal text-neutral-800 text-sm leading-tight hover:text-primary-400"
                            href={`/dao/${network}/${addressOrEns}/flow/policies/${row.policyId}`}
                        >
                            {row.policyName}
                        </Link>
                        <DetailCell row={row} />
                        <ContextCell
                            addressOrEns={addressOrEns}
                            network={network}
                            row={row}
                        />
                        <TxCell row={row} />
                        <span className="sr-only">
                            {formatShortDate(row.at)}
                        </span>
                    </li>
                ))}
                {rows.length === 0 && (
                    <li className="py-6 text-center font-normal text-neutral-500 text-sm">
                        No activity matches the current filters.
                    </li>
                )}
            </ul>
        </section>
    );
};

// ---------------------------------------------------------------------------
// Cells
// ---------------------------------------------------------------------------

const DetailCell: React.FC<{ row: IActivityRow }> = ({ row }) => {
    if (row.type === 'dispatch' && row.amount != null && row.token != null) {
        // Swap dispatch → "IN amount + chip → OUT chip (+ amount if we have it)".
        // Uniswap OUT amount is usually unknown (pool-side settlement), so we
        // degrade gracefully to just "IN → OUT chip".
        if (row.amountIn != null && row.tokenIn != null && row.tokenOut) {
            return (
                <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-neutral-800 text-sm tabular-nums leading-tight">
                        {formatFlowAmount(row.amountIn, row.tokenIn)}
                    </span>
                    <FlowTokenChip token={row.tokenIn} />
                    <span aria-hidden={true} className="text-neutral-400">
                        →
                    </span>
                    {row.amountOut != null ? (
                        <span className="font-semibold text-neutral-800 text-sm tabular-nums leading-tight">
                            {formatFlowAmount(row.amountOut, row.tokenOut)}
                        </span>
                    ) : null}
                    <FlowTokenChip token={row.tokenOut} />
                </span>
            );
        }
        return (
            <span className="flex min-w-0 items-center gap-2">
                <span className="font-semibold text-neutral-800 text-sm tabular-nums leading-tight">
                    {formatFlowAmount(row.amount, row.token)} {row.token}
                </span>
                <FlowTokenChip token={row.token} />
            </span>
        );
    }
    return (
        <span className="flex min-w-0 items-center gap-2">
            {row.strategy != null && (
                <FlowStrategyChip strategy={row.strategy} />
            )}
        </span>
    );
};

const ContextCell: React.FC<{
    row: IActivityRow;
    network: string;
    addressOrEns: string;
}> = ({ row, network, addressOrEns }) => {
    if (row.type === 'dispatch') {
        return (
            <span className="truncate font-normal text-neutral-500 text-sm leading-tight">
                → {row.recipientLabel ?? '—'}
            </span>
        );
    }
    const hasProposal =
        typeof row.proposalSlug === 'string' && row.proposalSlug.length > 0;
    const suffix = hasProposal ? ` · Proposal ${row.proposalId}` : '';

    if (hasProposal) {
        return (
            <Link
                className="min-w-0 truncate font-normal text-primary-400 text-sm leading-tight hover:text-primary-600"
                href={`/dao/${network}/${addressOrEns}/proposals/${row.proposalSlug}`}
            >
                {row.description ?? '—'}
                {suffix}
            </Link>
        );
    }
    return (
        <span className="min-w-0 truncate font-normal text-neutral-500 text-sm leading-tight">
            {row.description ?? '—'}
        </span>
    );
};

const TxCell: React.FC<{ row: IActivityRow }> = ({ row }) => {
    if (!row.txHash) {
        return <span />;
    }
    return (
        <span className="min-w-0 truncate text-right font-normal text-primary-400 text-xs tabular-nums leading-tight">
            {shortTx(row.txHash)}
        </span>
    );
};

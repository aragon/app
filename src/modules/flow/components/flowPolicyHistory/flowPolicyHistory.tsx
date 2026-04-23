'use client';

import classNames from 'classnames';
import { useMemo, useState } from 'react';
import type { FlowEventKind, IFlowPolicy } from '../../types';
import {
    formatFlowAmount,
    formatRelative,
    formatShortDate,
} from '../../utils/flowFormatters';
import { FlowTokenChip } from '../flowPrimitives';

export interface IFlowPolicyHistoryProps {
    policy: IFlowPolicy;
    className?: string;
}

type HistoryFilter = 'all' | 'dispatches' | 'events' | 'failed';

interface IHistoryRow {
    id: string;
    kind: 'dispatch' | FlowEventKind;
    at: string;
    timestamp: number;
    title: string;
    description?: string;
    amount?: number;
    tokenSymbol?: IFlowPolicy['token'];
    recipientsCount?: number;
    txHash?: string;
    proposalId?: string;
    failed?: boolean;
}

const eventTone: Record<FlowEventKind, string> = {
    policyInstalled: 'bg-neutral-100 text-neutral-700',
    policyUninstalled: 'bg-critical-100 text-critical-800',
    paused: 'bg-warning-100 text-warning-800',
    resumed: 'bg-success-100 text-success-800',
    settingsUpdated: 'bg-neutral-100 text-neutral-700',
    proposalApplied: 'bg-primary-100 text-primary-800',
    recipientsUpdated: 'bg-info-100 text-info-800',
    dispatchFailed: 'bg-critical-100 text-critical-800',
};

const eventTypeLabel: Record<FlowEventKind, string> = {
    policyInstalled: 'Installed',
    policyUninstalled: 'Uninstalled',
    paused: 'Paused',
    resumed: 'Resumed',
    settingsUpdated: 'Settings',
    proposalApplied: 'Proposal',
    recipientsUpdated: 'Recipients',
    dispatchFailed: 'Failed',
};

const filterLabels: Record<HistoryFilter, string> = {
    all: 'All',
    dispatches: 'Dispatches',
    events: 'Events',
    failed: 'Failed',
};

const buildRows = (policy: IFlowPolicy): IHistoryRow[] => {
    const rows: IHistoryRow[] = [];
    for (const dispatch of policy.dispatches) {
        const isFailed = dispatch.status === 'failed';
        rows.push({
            id: `d-${dispatch.id}`,
            kind: 'dispatch',
            at: dispatch.at,
            timestamp: new Date(dispatch.at).getTime(),
            title: isFailed
                ? 'Dispatch failed'
                : `${policy.verb.charAt(0).toUpperCase()}${policy.verb.slice(1)}`,
            description: isFailed
                ? (dispatch.failureReason ?? 'Dispatch reverted.')
                : dispatch.recipientsCount === 0
                  ? 'No recipients'
                  : `${dispatch.recipientsCount} recipient${dispatch.recipientsCount === 1 ? '' : 's'}`,
            amount: dispatch.amount,
            tokenSymbol: dispatch.token,
            recipientsCount: dispatch.recipientsCount,
            txHash: dispatch.txHash,
            failed: isFailed,
        });
    }
    for (const event of policy.events) {
        rows.push({
            id: `e-${event.id}`,
            kind: event.kind,
            at: event.at,
            timestamp: new Date(event.at).getTime(),
            title: event.title,
            description: event.description,
            txHash: event.txHash,
            proposalId: event.proposalId,
            failed: event.kind === 'dispatchFailed',
        });
    }
    return rows.sort((a, b) => b.timestamp - a.timestamp);
};

export const FlowPolicyHistory: React.FC<IFlowPolicyHistoryProps> = (props) => {
    const { policy, className } = props;
    const [filter, setFilter] = useState<HistoryFilter>('all');

    const rows = useMemo(() => buildRows(policy), [policy]);
    const filtered = useMemo(() => {
        if (filter === 'all') {
            return rows;
        }
        if (filter === 'dispatches') {
            return rows.filter((r) => r.kind === 'dispatch' && !r.failed);
        }
        if (filter === 'events') {
            return rows.filter((r) => r.kind !== 'dispatch');
        }
        return rows.filter((r) => r.failed === true);
    }, [rows, filter]);

    const counts = useMemo(
        () => ({
            all: rows.length,
            dispatches: rows.filter((r) => r.kind === 'dispatch' && !r.failed)
                .length,
            events: rows.filter((r) => r.kind !== 'dispatch').length,
            failed: rows.filter((r) => r.failed === true).length,
        }),
        [rows],
    );

    return (
        <section
            className={classNames(
                'flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:p-6',
                className,
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-lg text-neutral-800 leading-tight">
                    History
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                    {(Object.keys(filterLabels) as HistoryFilter[]).map(
                        (key) => (
                            <button
                                aria-pressed={filter === key}
                                className={classNames(
                                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs leading-tight transition-colors',
                                    filter === key
                                        ? key === 'failed' && counts.failed > 0
                                            ? 'bg-critical-100 text-critical-800'
                                            : 'bg-neutral-800 text-neutral-0'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                                )}
                                key={key}
                                onClick={() => setFilter(key)}
                                type="button"
                            >
                                {filterLabels[key]}
                                <span
                                    className={classNames(
                                        'font-normal tabular-nums',
                                        filter === key
                                            ? 'opacity-80'
                                            : 'text-neutral-500',
                                    )}
                                >
                                    {counts[key]}
                                </span>
                            </button>
                        ),
                    )}
                </div>
            </div>

            <ul className="flex flex-col divide-y divide-neutral-100">
                {filtered.map((row) => (
                    <li
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3"
                        key={row.id}
                    >
                        <span className="w-20 shrink-0 font-normal text-neutral-500 text-sm tabular-nums leading-tight">
                            {formatRelative(row.at)}
                        </span>
                        <TypeTag failed={row.failed} kind={row.kind} />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span
                                className={classNames(
                                    'truncate font-semibold text-sm leading-tight',
                                    row.failed
                                        ? 'text-critical-800'
                                        : 'text-neutral-800',
                                )}
                            >
                                {row.title}
                            </span>
                            {row.description != null && (
                                <span className="truncate font-normal text-neutral-500 text-sm leading-tight">
                                    {row.description}
                                </span>
                            )}
                        </div>
                        {row.amount != null && row.tokenSymbol != null && (
                            <span className="flex items-center gap-2">
                                <span
                                    className={classNames(
                                        'font-semibold text-sm tabular-nums leading-tight',
                                        row.failed
                                            ? 'text-critical-800 line-through'
                                            : 'text-neutral-800',
                                    )}
                                >
                                    {formatFlowAmount(
                                        row.amount,
                                        row.tokenSymbol,
                                    )}{' '}
                                    {row.tokenSymbol}
                                </span>
                                <FlowTokenChip token={row.tokenSymbol} />
                            </span>
                        )}
                        {row.proposalId != null && (
                            <span className="font-normal text-primary-400 text-xs leading-tight">
                                {row.proposalId}
                            </span>
                        )}
                        {row.txHash != null && (
                            <span className="w-28 shrink-0 truncate font-normal text-neutral-500 text-xs leading-tight">
                                {row.txHash}
                            </span>
                        )}
                        <span className="sr-only">
                            {formatShortDate(row.at)}
                        </span>
                    </li>
                ))}
                {filtered.length === 0 && (
                    <li className="py-6 text-center font-normal text-neutral-500 text-sm">
                        No entries match this filter yet.
                    </li>
                )}
            </ul>
        </section>
    );
};

const TypeTag: React.FC<{
    kind: IHistoryRow['kind'];
    failed?: boolean;
}> = ({ kind, failed }) => {
    if (kind === 'dispatch') {
        return (
            <span
                className={classNames(
                    'inline-flex w-24 shrink-0 items-center justify-center rounded-full px-2 py-0.5 font-semibold text-[10px] uppercase leading-tight tracking-wide',
                    failed
                        ? 'bg-critical-100 text-critical-800'
                        : 'bg-primary-100 text-primary-800',
                )}
            >
                {failed ? 'Failed' : 'Dispatch'}
            </span>
        );
    }
    return (
        <span
            className={classNames(
                'inline-flex w-24 shrink-0 items-center justify-center rounded-full px-2 py-0.5 font-semibold text-[10px] uppercase leading-tight tracking-wide',
                eventTone[kind],
            )}
        >
            {eventTypeLabel[kind]}
        </span>
    );
};

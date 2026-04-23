'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import type {
    FlowTokenSymbol,
    IFlowDaoData,
    IFlowPolicy,
    IFlowRecipient,
} from '../../types';
import { formatFlowAmount, formatRelative } from '../../utils/flowFormatters';
import { FlowAddressLabel, FlowBlockieAvatar } from '../flowPrimitives';

export type FlowRecipientsVariant = 'preview' | 'full' | 'policy';

export interface IFlowRecipientsTableProps {
    data: IFlowDaoData;
    variant?: FlowRecipientsVariant;
    limit?: number;
    policy?: IFlowPolicy;
    className?: string;
}

interface IRecipientRow {
    address: string;
    name: string;
    ens?: string | null;
    role?: IFlowRecipient['role'];
    group: string;
    fromPolicies: string[];
    amountsByToken: Partial<Record<FlowTokenSymbol, number>>;
    lastReceivedAt?: string;
    dispatchCount?: number;
    ratio?: string;
    pct?: number;
}

const parseRatioShare = (ratio: string | undefined): number | undefined => {
    if (ratio == null) {
        return undefined;
    }
    const parts = ratio
        .split(':')
        .map((p) => Number.parseFloat(p.trim()))
        .filter((n) => Number.isFinite(n));
    if (parts.length < 2) {
        return undefined;
    }
    const total = parts.reduce((sum, v) => sum + v, 0);
    if (total === 0) {
        return undefined;
    }
    return parts[0] / total;
};

const resolveShare = (
    recipient: IFlowRecipient,
    fallbackCount: number,
): number => {
    if (recipient.pct != null) {
        return recipient.pct / 100;
    }
    const fromRatio = parseRatioShare(recipient.ratio);
    if (fromRatio != null) {
        return fromRatio;
    }
    return fallbackCount > 0 ? 1 / fallbackCount : 0;
};

const buildPolicyRows = (policy: IFlowPolicy): IRecipientRow[] => {
    const recipients = policy.schema.recipients;
    const successful = policy.dispatches.filter((d) => d.status !== 'failed');

    return recipients.map((r) => {
        const share = resolveShare(r, recipients.length);
        let total = 0;
        let lastReceivedAt: string | undefined;
        let dispatchCount = 0;

        for (const dispatch of successful) {
            total += dispatch.amount * share;
            dispatchCount += 1;
            if (
                lastReceivedAt == null ||
                new Date(dispatch.at).getTime() >
                    new Date(lastReceivedAt).getTime()
            ) {
                lastReceivedAt = dispatch.at;
            }
        }

        return {
            address: r.address,
            name: r.name,
            ens: r.ens,
            role: r.role,
            group: policy.recipientGroup,
            fromPolicies: [policy.name],
            amountsByToken: total > 0 ? { [policy.token]: total } : {},
            ratio: r.ratio,
            pct: r.pct ?? Number((share * 100).toFixed(2)),
            lastReceivedAt,
            dispatchCount,
        };
    });
};

const buildGlobalRows = (data: IFlowDaoData): IRecipientRow[] =>
    data.recipients.map((r) => ({
        address: r.address,
        name: r.name,
        ens: r.ens,
        role: r.role,
        group: r.group,
        fromPolicies: r.fromPolicyIds.map(
            (id) => data.policies.find((p) => p.id === id)?.name ?? id,
        ),
        amountsByToken: r.amountsByToken,
        lastReceivedAt: r.lastReceivedAt,
        dispatchCount: r.dispatchCount,
    }));

const formatAmounts = (
    amounts: Partial<Record<FlowTokenSymbol, number>>,
): string => {
    const parts = Object.entries(amounts)
        .filter(([, v]) => v != null && v > 0)
        .map(
            ([token, value]) =>
                `${formatFlowAmount(value as number, token as FlowTokenSymbol)} ${token}`,
        );
    return parts.length === 0 ? '—' : parts.join(' · ');
};

export const FlowRecipientsTable: React.FC<IFlowRecipientsTableProps> = (
    props,
) => {
    const { data, variant = 'full', limit, policy, className } = props;

    const allRows = useMemo(() => {
        if (variant === 'policy' && policy != null) {
            return buildPolicyRows(policy);
        }
        return buildGlobalRows(data);
    }, [data, variant, policy]);

    const [query, setQuery] = useState('');

    const rows = useMemo(() => {
        if (variant === 'preview') {
            return allRows.slice(0, limit ?? 5);
        }
        if (query.trim() === '') {
            return allRows;
        }
        const needle = query.toLowerCase();
        return allRows.filter(
            (row) =>
                row.name.toLowerCase().includes(needle) ||
                row.address.toLowerCase().includes(needle),
        );
    }, [allRows, variant, limit, query]);

    const title =
        variant === 'policy'
            ? 'Recipients'
            : variant === 'preview'
              ? 'Top recipients'
              : 'Recipients';

    return (
        <section
            className={classNames(
                'flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-4 md:p-6',
                className,
            )}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold text-lg text-neutral-800 leading-tight">
                    {title}
                </h2>
                {variant === 'preview' && (
                    <Link
                        className="font-normal text-primary-400 text-sm leading-tight hover:text-primary-600"
                        href={`/dao/${data.dao.network}/${data.dao.addressOrEns}/flow/recipients`}
                    >
                        View all →
                    </Link>
                )}
                {variant === 'full' && (
                    <input
                        className="rounded-md border border-neutral-100 bg-neutral-0 px-2 py-1 text-neutral-800 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search recipients or addresses"
                        type="search"
                        value={query}
                    />
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-left">
                    <thead>
                        <tr className="border-neutral-100 border-b font-normal text-neutral-500 text-xs uppercase tracking-wide">
                            <th className="py-2 pr-4 font-normal">Recipient</th>
                            {variant === 'policy' ? (
                                <>
                                    <th className="py-2 pr-4 font-normal">
                                        Total received
                                    </th>
                                    <th className="py-2 pr-4 font-normal">
                                        Last received
                                    </th>
                                    <th className="py-2 pr-4 font-normal">
                                        # dispatches
                                    </th>
                                    <th className="py-2 pr-4 font-normal">
                                        Share
                                    </th>
                                </>
                            ) : (
                                <>
                                    <th className="py-2 pr-4 font-normal">
                                        From policies
                                    </th>
                                    <th className="py-2 pr-4 font-normal">
                                        Per-token totals
                                    </th>
                                    <th className="py-2 pr-4 font-normal">
                                        Last received
                                    </th>
                                    <th className="py-2 pr-4 font-normal">
                                        # dispatches
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                className="border-neutral-100 border-b last:border-0"
                                key={`${row.address}-${row.name}`}
                            >
                                <td className="py-3 pr-4">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <FlowBlockieAvatar
                                            address={row.address}
                                            size={22}
                                        />
                                        <FlowAddressLabel
                                            address={row.address}
                                            className="min-w-0"
                                            knownEns={row.ens}
                                            knownLabel={
                                                row.role != null
                                                    ? row.name
                                                    : undefined
                                            }
                                            knownRole={row.role}
                                        />
                                    </div>
                                </td>
                                {variant === 'policy' ? (
                                    <>
                                        <td className="py-3 pr-4 font-normal text-neutral-800 text-sm tabular-nums">
                                            {formatAmounts(row.amountsByToken)}
                                        </td>
                                        <td className="py-3 pr-4 font-normal text-neutral-500 text-sm">
                                            {row.lastReceivedAt != null
                                                ? formatRelative(
                                                      row.lastReceivedAt,
                                                  )
                                                : '—'}
                                        </td>
                                        <td className="py-3 pr-4 font-normal text-neutral-700 text-sm tabular-nums">
                                            {row.dispatchCount ?? 0}
                                        </td>
                                        <td className="py-3 pr-4 font-normal text-neutral-700 text-sm tabular-nums">
                                            {row.ratio ??
                                                (row.pct != null
                                                    ? `${row.pct}%`
                                                    : '—')}
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="py-3 pr-4 font-normal text-neutral-700 text-sm">
                                            {row.fromPolicies.join(', ')}
                                        </td>
                                        <td className="py-3 pr-4 font-normal text-neutral-700 text-sm tabular-nums">
                                            {formatAmounts(row.amountsByToken)}
                                        </td>
                                        <td className="py-3 pr-4 font-normal text-neutral-500 text-sm">
                                            {row.lastReceivedAt != null
                                                ? formatRelative(
                                                      row.lastReceivedAt,
                                                  )
                                                : '—'}
                                        </td>
                                        <td className="py-3 pr-4 font-normal text-neutral-700 text-sm tabular-nums">
                                            {row.dispatchCount ?? '—'}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td
                                    className="py-6 text-center font-normal text-neutral-500 text-sm"
                                    colSpan={5}
                                >
                                    No recipients match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

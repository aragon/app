'use client';

import classNames from 'classnames';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useLmmManifest } from '../../demo/useLmmManifest';
import { useFlowDataContext } from '../../providers/flowDataProvider';
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

// ---------------------------------------------------------------------------
// LMM_DEMO_HACK: destinations-from-manifest
//
// Orchestrator policies don't have a 1:1 "recipient list" the way leaf
// routers do — every leg sends value to a different sink (DAO self,
// UniV2 pool, CowSwap settlement, buyback recipient).  We synthesise the
// destination rows from the manifest (`lmm-manifest.json` → `lmm.dao`,
// `lido.agent`, `cowSwap.settlement`) and accumulate per-destination
// totals from `policy.dispatches` filtered by `legKind` (already emitted
// by the indexer via `execution.strategy.kind` — see
// envioFlowMapper.mapExecutionToDispatch).
//
// We deliberately don't traverse `orchestrator.runs[]` here: for the LMM
// demo the orchestrator's `subRouters` are *strategy contract addresses*,
// not indexer `Policy` rows, so `runs` is empty.  The legs we need are
// the dispatcher policy's own dispatches.
//
// Production removal: emit explicit `recipient` on `ExecutionTransfer` for
// the synthetic destinations (LP recipient, CowSwap settlement) from the
// indexer side.  See lido-mmd-status.md `destinations-from-manifest`.
// ---------------------------------------------------------------------------

type LegKind = NonNullable<IFlowPolicy['dispatches'][number]['legKind']>;

interface ILmmDestinationSeed {
    address: string;
    name: string;
    role: IFlowRecipient['role'];
    group: string;
    legKinds: LegKind[];
}

const buildDestinationsRows = (
    policy: IFlowPolicy,
    seeds: ILmmDestinationSeed[],
): IRecipientRow[] => {
    if (seeds.length === 0) {
        return [];
    }
    return seeds.map((seed) => {
        const matching = policy.dispatches.filter(
            (d) =>
                d.legKind != null &&
                seed.legKinds.includes(d.legKind) &&
                d.status !== 'failed',
        );
        const amountsByToken: Partial<Record<FlowTokenSymbol, number>> = {};
        let lastReceivedAt: string | undefined;
        for (const d of matching) {
            // Count `amount`/`token` (the dispatch's headline value) — not
            // `amountIn`/`tokenIn`, which the swap/cow paths populate as a
            // duplicate of the same number and would otherwise double-count.
            // For non-swap legs (wrap/uniV2 leg-input fallback) `amountIn` is
            // intentionally undefined, so this branch is the single source of
            // truth across all leg kinds.
            if (d.amount > 0 && d.token !== '') {
                amountsByToken[d.token] =
                    (amountsByToken[d.token] ?? 0) + d.amount;
            }
            if (
                lastReceivedAt == null ||
                new Date(d.at).getTime() > new Date(lastReceivedAt).getTime()
            ) {
                lastReceivedAt = d.at;
            }
        }
        return {
            address: seed.address,
            name: seed.name,
            role: seed.role,
            group: seed.group,
            fromPolicies: [policy.name],
            amountsByToken,
            lastReceivedAt,
            dispatchCount: matching.length,
        };
    });
};

const useLmmDestinationSeeds = (
    policy: IFlowPolicy | undefined,
): ILmmDestinationSeed[] => {
    const { liveSnapshot } = useFlowDataContext();
    const { manifest } = useLmmManifest();
    if (
        policy == null ||
        manifest == null ||
        liveSnapshot?.dispatcherAddress == null ||
        policy.address.toLowerCase() !==
            liveSnapshot.dispatcherAddress.toLowerCase()
    ) {
        return [];
    }
    const seeds: ILmmDestinationSeed[] = [];
    seeds.push({
        address: manifest.lmm.dao,
        name: 'LMM DAO (self · wstETH)',
        role: 'dao',
        group: 'Wrap',
        legKinds: ['WRAP'],
    });
    const lpRecipient =
        // Lido Agent is the LP recipient on the demo deployment — see
        // dao-launchpad/lido/preview/script/demo.  Manifest exposes it
        // as `lido.agent`.
        manifest.lido?.agent ?? manifest.lmm.dao;
    seeds.push({
        address: lpRecipient,
        name: 'Lido Agent (UniV2 LP)',
        role: 'linkedaccount',
        group: 'UniV2 LP',
        legKinds: ['UNIV2_LIQUIDITY'],
    });
    const cowSwap = manifest.cowSwap?.settlement;
    if (cowSwap) {
        seeds.push({
            address: cowSwap,
            name: 'CowSwap settlement',
            role: 'router',
            group: 'Buyback',
            legKinds: ['GATED_COWSWAP', 'COWSWAP'],
        });
    }
    return seeds;
};

export const FlowRecipientsTable: React.FC<IFlowRecipientsTableProps> = (
    props,
) => {
    const { data, variant = 'full', limit, policy, className } = props;

    const lmmSeeds = useLmmDestinationSeeds(policy);
    const isDestinationsVariant = variant === 'policy' && lmmSeeds.length > 0;

    const allRows = useMemo(() => {
        if (variant === 'policy' && policy != null) {
            if (lmmSeeds.length > 0) {
                return buildDestinationsRows(policy, lmmSeeds);
            }
            return buildPolicyRows(policy);
        }
        return buildGlobalRows(data);
    }, [data, variant, policy, lmmSeeds]);

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

    const title = isDestinationsVariant
        ? 'Destinations'
        : variant === 'policy'
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
                            <th className="py-2 pr-4 font-normal">
                                {isDestinationsVariant
                                    ? 'Destination'
                                    : 'Recipient'}
                            </th>
                            {variant === 'policy' ? (
                                <>
                                    <th className="py-2 pr-4 font-normal">
                                        {isDestinationsVariant
                                            ? 'Cumulative routed'
                                            : 'Total received'}
                                    </th>
                                    <th className="py-2 pr-4 font-normal">
                                        Last routed
                                    </th>
                                    {!isDestinationsVariant && (
                                        <th className="py-2 pr-4 font-normal">
                                            # dispatches
                                        </th>
                                    )}
                                    <th className="py-2 pr-4 font-normal">
                                        {isDestinationsVariant
                                            ? 'Role'
                                            : 'Share'}
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
                                        {!isDestinationsVariant && (
                                            <td className="py-3 pr-4 font-normal text-neutral-700 text-sm tabular-nums">
                                                {row.dispatchCount ?? 0}
                                            </td>
                                        )}
                                        <td className="py-3 pr-4 font-normal text-neutral-700 text-sm tabular-nums">
                                            {isDestinationsVariant
                                                ? row.group
                                                : (row.ratio ??
                                                  (row.pct != null
                                                      ? `${row.pct}%`
                                                      : '—'))}
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
                                    {isDestinationsVariant
                                        ? 'No destinations have received funds yet — the orchestrator hasn’t dispatched.'
                                        : 'No recipients match the current filters.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

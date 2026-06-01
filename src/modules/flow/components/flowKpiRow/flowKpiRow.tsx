'use client';

import classNames from 'classnames';
import { useFlowDataContext } from '../../providers/flowDataProvider';
import {
    derivePolicyStatus,
    getAllPolicies,
    summariseLmmLegs,
} from '../../providers/flowSelectors';
import type { FlowTokenSymbol, IFlowDaoData } from '../../types';
import { formatFlowAmount } from '../../utils/flowFormatters';

export interface IFlowKpiRowProps {
    data: IFlowDaoData;
}

interface IKpiItem {
    label: string;
    value: string;
    hint?: string;
    deltaLabel?: string;
    deltaTone?: 'up' | 'down' | 'flat';
    tone?: 'default' | 'critical' | 'primary';
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const toneClasses: Record<NonNullable<IKpiItem['tone']>, string> = {
    default: 'border-neutral-100',
    critical: 'border-critical-200 bg-critical-50',
    // Neutral primary tint — matches the gov-ui-kit highlight without the
    // saturated blue background of the previous `primary-50` variant.
    primary: 'border-primary-200',
};

const deltaClasses: Record<'up' | 'down' | 'flat', string> = {
    up: 'text-neutral-700',
    down: 'text-critical-700',
    flat: 'text-neutral-500',
};

export const FlowKpiRow: React.FC<IFlowKpiRowProps> = (props) => {
    const { data } = props;
    const { now, liveSnapshot } = useFlowDataContext();

    // Iterate both leaves AND orchestrator mirrors so KPI numbers no longer
    // ignore the LMM dispatcher (and any future multi-router orchestrator).
    const allPolicies = getAllPolicies(data);

    // LMM_DEMO_HACK: pending-from-live.  Merge the live RPC snapshot's
    // per-leg budgets into the dispatcher policy's pending view so
    // `Ready to dispatch` reports the real on-chain queue.  Otherwise
    // the orchestrator looks empty until the indexer surfaces an
    // execution.  See providers/flowSelectors.ts → summariseLmmLegs.
    const lmmAggregate = summariseLmmLegs(liveSnapshot?.snapshot ?? null);
    const lmmDispatcher = liveSnapshot?.dispatcherAddress;

    const readyPolicies = allPolicies.filter((p) => {
        // Treat the LMM orchestrator as "ready" whenever any leg has
        // non-zero pending budget — even before the first dispatch.
        const isLmmOrchestrator =
            lmmDispatcher != null &&
            p.address.toLowerCase() === lmmDispatcher.toLowerCase();
        const pending = isLmmOrchestrator ? lmmAggregate.dominant : p.pending;
        return derivePolicyStatus(p, now, pending).status === 'ready';
    });
    const readyCount = readyPolicies.length;

    // Ready-summary subtext: prefer the per-leg breakdown from the live
    // snapshot ("100 stETH + 36.4 LDO") over the per-policy pending,
    // since for orchestrators every leg consumes a different token.
    const formatLeg = (amount: number, token: FlowTokenSymbol): string =>
        `${formatFlowAmount(amount, token)} ${token}`;
    const lmmSubtitleParts = lmmAggregate.legs
        .filter((l) => l.amount > 0)
        .slice(0, 2)
        .map((l) => formatLeg(l.amount, l.token));

    const pendingByToken = readyPolicies.reduce<
        Partial<Record<FlowTokenSymbol, number>>
    >((acc, policy) => {
        if (policy.pending == null) {
            return acc;
        }
        acc[policy.pending.token] =
            (acc[policy.pending.token] ?? 0) + policy.pending.amount;
        return acc;
    }, {});
    const flatPendingSubtitleParts = Object.entries(pendingByToken).map(
        ([token, amount]) =>
            formatLeg(amount as number, token as FlowTokenSymbol),
    );
    const subtitleParts =
        lmmSubtitleParts.length > 0
            ? lmmSubtitleParts
            : flatPendingSubtitleParts;
    const pendingSummary =
        subtitleParts.length > 0
            ? subtitleParts.join(' + ')
            : readyCount === 0
              ? 'nothing queued'
              : 'no queued amounts';

    const dispatches7d = allPolicies.reduce(
        (sum, policy) =>
            sum +
            policy.dispatches.filter(
                (d) =>
                    d.status !== 'failed' &&
                    now - new Date(d.at).getTime() <= WEEK_MS,
            ).length,
        0,
    );
    const dispatchesPrev7d = allPolicies.reduce(
        (sum, policy) =>
            sum +
            policy.dispatches.filter((d) => {
                if (d.status === 'failed') {
                    return false;
                }
                const ts = new Date(d.at).getTime();
                const delta = now - ts;
                return delta > WEEK_MS && delta <= 2 * WEEK_MS;
            }).length,
        0,
    );
    const dispatchesDelta = dispatches7d - dispatchesPrev7d;
    const dispatchesDeltaTone: IKpiItem['deltaTone'] =
        dispatchesDelta > 0 ? 'up' : dispatchesDelta < 0 ? 'down' : 'flat';
    const dispatchesDeltaLabel =
        dispatchesDelta === 0
            ? 'same as prev 7d'
            : `${dispatchesDelta > 0 ? '+' : ''}${dispatchesDelta} vs prev 7d`;

    const failed7d = allPolicies.reduce(
        (sum, policy) =>
            sum +
            policy.dispatches.filter(
                (d) =>
                    d.status === 'failed' &&
                    now - new Date(d.at).getTime() <= WEEK_MS,
            ).length,
        0,
    );
    const failedEver = allPolicies.reduce(
        (sum, policy) =>
            sum + policy.dispatches.filter((d) => d.status === 'failed').length,
        0,
    );

    const items: IKpiItem[] = [
        {
            label: 'Ready to dispatch',
            value: `${readyCount}`,
            hint: pendingSummary,
            tone: readyCount > 0 ? 'primary' : 'default',
        },
        {
            label: 'Dispatches · 7d',
            value: `${dispatches7d}`,
            deltaLabel: dispatchesDeltaLabel,
            deltaTone: dispatchesDeltaTone,
        },
        failed7d > 0
            ? {
                  label: 'Failed · 7d',
                  value: `${failed7d}`,
                  hint: `${failedEver} total failures`,
                  tone: 'critical',
              }
            : {
                  label: 'Failed · 7d',
                  value: '0',
                  hint: 'All operational',
                  tone: 'default',
              },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {items.map((item) => (
                <div
                    className={classNames(
                        'flex flex-col gap-1 rounded-xl border bg-neutral-0 p-4 shadow-neutral-sm',
                        toneClasses[item.tone ?? 'default'],
                    )}
                    key={item.label}
                >
                    <span className="font-normal text-neutral-500 text-sm leading-tight">
                        {item.label}
                    </span>
                    <span className="font-semibold text-2xl text-neutral-800 leading-tight md:text-3xl">
                        {item.value}
                    </span>
                    {item.deltaLabel != null && (
                        <span
                            className={classNames(
                                'font-semibold text-xs leading-tight',
                                deltaClasses[item.deltaTone ?? 'flat'],
                            )}
                        >
                            {item.deltaTone === 'up' && '▲ '}
                            {item.deltaTone === 'down' && '▼ '}
                            {item.deltaLabel}
                        </span>
                    )}
                    {item.hint != null && (
                        <span className="font-normal text-neutral-500 text-xs leading-tight">
                            {item.hint}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
};

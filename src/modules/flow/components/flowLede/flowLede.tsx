'use client';

import { useFlowDataContext } from '../../providers/flowDataProvider';
import {
    derivePolicyStatus,
    getAllPolicies,
    summariseLmmLegs,
} from '../../providers/flowSelectors';
import type { FlowTokenSymbol, IFlowDaoData } from '../../types';
import { formatFlowAmount, formatRelative } from '../../utils/flowFormatters';

export interface IFlowLedeProps {
    data: IFlowDaoData;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const FlowLede: React.FC<IFlowLedeProps> = (props) => {
    const { data } = props;
    const { dao } = data;
    const { now, liveSnapshot } = useFlowDataContext();

    // Iterate every policy (leaves + orchestrator mirrors) so the lede
    // talks about the orchestrator the same way it talks about leaves.
    const allPolicies = getAllPolicies(data);
    const lmmAggregate = summariseLmmLegs(liveSnapshot?.snapshot ?? null);
    const lmmDispatcher = liveSnapshot?.dispatcherAddress;

    const readyPolicies = allPolicies.filter((p) => {
        const isLmmOrchestrator =
            lmmDispatcher != null &&
            p.address.toLowerCase() === lmmDispatcher.toLowerCase();
        const pending = isLmmOrchestrator ? lmmAggregate.dominant : p.pending;
        return derivePolicyStatus(p, now, pending).status === 'ready';
    });

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

    const lmmSubtitleParts = lmmAggregate.legs
        .filter((l) => l.amount > 0)
        .slice(0, 2)
        .map((l) => `${formatFlowAmount(l.amount, l.token)} ${l.token}`);
    const flatPendingParts = Object.entries(pendingByToken).map(
        ([token, amount]) =>
            `${formatFlowAmount(amount as number, token as FlowTokenSymbol)} ${token}`,
    );
    const pendingSummary =
        lmmSubtitleParts.length > 0
            ? lmmSubtitleParts.join(' + ')
            : flatPendingParts.join(' + ');

    const cooldownPolicies = allPolicies
        .filter(
            (p) =>
                p.cooldown != null &&
                derivePolicyStatus(p, now).status !== 'ready',
        )
        .map((p) => p.cooldown!)
        .sort(
            (a, b) =>
                new Date(a.readyAt).getTime() - new Date(b.readyAt).getTime(),
        );
    const nextReady = cooldownPolicies[0];

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

    const narrativeParts: string[] = [];
    if (readyPolicies.length > 0) {
        narrativeParts.push(
            `${pendingSummary || `${readyPolicies.length}`} ready to dispatch across ${readyPolicies.length} polic${readyPolicies.length === 1 ? 'y' : 'ies'}`,
        );
    }
    if (nextReady != null) {
        narrativeParts.push(
            `next autonomous dispatch ${formatRelative(nextReady.readyAt, now)}`,
        );
    }
    if (failed7d > 0) {
        narrativeParts.push(`${failed7d} failed last week`);
    } else {
        narrativeParts.push('all operational');
    }

    return (
        <div className="flex flex-col gap-1">
            <h1 className="font-semibold text-2xl text-neutral-800 leading-tight md:text-3xl">
                {dao.name}
            </h1>
            <p className="font-normal text-base text-neutral-500 leading-relaxed md:text-lg">
                {narrativeParts.join(' · ')}.
            </p>
        </div>
    );
};

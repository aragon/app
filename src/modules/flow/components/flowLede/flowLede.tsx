import {
    FLOW_ACTIVE_STATUSES,
    type FlowTokenSymbol,
    type IFlowDaoData,
} from '../../types';
import { formatFlowAmount, formatRelative } from '../../utils/flowFormatters';

export interface IFlowLedeProps {
    data: IFlowDaoData;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const FlowLede: React.FC<IFlowLedeProps> = (props) => {
    const { data } = props;
    const { dao, policies } = data;

    const readyPolicies = policies.filter((p) => p.status === 'ready');
    const activePolicies = policies.filter((p) =>
        FLOW_ACTIVE_STATUSES.includes(p.status),
    );

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

    const pendingSummary = Object.entries(pendingByToken)
        .map(
            ([token, amount]) =>
                `${formatFlowAmount(amount as number, token as FlowTokenSymbol)} ${token}`,
        )
        .join(' + ');

    const cooldownPolicies = policies
        .filter((p) => p.cooldown != null && p.status !== 'ready')
        .map((p) => p.cooldown!)
        .sort(
            (a, b) =>
                new Date(a.readyAt).getTime() - new Date(b.readyAt).getTime(),
        );
    const nextReady = cooldownPolicies[0];

    const now = Date.now();
    const failed7d = policies.reduce(
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
    } else {
        narrativeParts.push(
            `${activePolicies.length} active automation${activePolicies.length === 1 ? '' : 's'}`,
        );
    }
    if (nextReady != null) {
        narrativeParts.push(
            `next autonomous dispatch ${formatRelative(nextReady.readyAt)}`,
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
                {dao.name} · Flow
            </h1>
            <p className="font-normal text-base text-neutral-500 leading-relaxed md:text-lg">
                {narrativeParts.join(' · ')}.
            </p>
        </div>
    );
};

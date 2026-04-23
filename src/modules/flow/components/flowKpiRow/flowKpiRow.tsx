import classNames from 'classnames';
import {
    FLOW_ACTIVE_STATUSES,
    type FlowTokenSymbol,
    type IFlowDaoData,
} from '../../types';
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
    tone?: 'default' | 'critical' | 'success' | 'primary';
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const toneClasses: Record<NonNullable<IKpiItem['tone']>, string> = {
    default: 'border-neutral-100',
    critical: 'border-critical-200 bg-critical-50',
    success: 'border-success-200 bg-success-50',
    primary: 'border-primary-200 bg-primary-50',
};

const deltaClasses: Record<'up' | 'down' | 'flat', string> = {
    up: 'text-success-700',
    down: 'text-critical-700',
    flat: 'text-neutral-500',
};

export const FlowKpiRow: React.FC<IFlowKpiRowProps> = (props) => {
    const { data } = props;
    const { policies } = data;

    const total = policies.length;
    const active = policies.filter((p) =>
        FLOW_ACTIVE_STATUSES.includes(p.status),
    ).length;
    const paused = policies.filter((p) => p.status === 'paused').length;
    const awaiting = policies.filter((p) => p.status === 'awaiting').length;

    const readyPolicies = policies.filter((p) => p.status === 'ready');
    const readyCount = readyPolicies.length;
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
    const pendingSummary =
        Object.entries(pendingByToken)
            .map(
                ([token, amount]) =>
                    `${formatFlowAmount(amount as number, token as FlowTokenSymbol)} ${token}`,
            )
            .join(' · ') || 'no queued amounts';

    const now = Date.now();
    const dispatches7d = policies.reduce(
        (sum, policy) =>
            sum +
            policy.dispatches.filter(
                (d) =>
                    d.status !== 'failed' &&
                    now - new Date(d.at).getTime() <= WEEK_MS,
            ).length,
        0,
    );
    const dispatchesPrev7d = policies.reduce(
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
    const failedEver = policies.reduce(
        (sum, policy) =>
            sum + policy.dispatches.filter((d) => d.status === 'failed').length,
        0,
    );

    const items: IKpiItem[] = [
        {
            label: 'Active automations',
            value: `${active} / ${total}`,
            hint: `${paused} paused · ${awaiting} awaiting`,
        },
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
                  tone: 'success',
              },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
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

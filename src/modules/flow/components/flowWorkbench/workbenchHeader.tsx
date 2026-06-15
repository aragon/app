'use client';

/**
 * Shared flow-canvas chrome pieces — flow selector, cumulative (token-only)
 * stats, next-run summary and dispatch controls — consumed by the Focus layout.
 * Auto-dispatch is rendered disabled (v1: the keeper service is a later
 * feature); "Dispatch now" is wired to the real `plugin.dispatch()` via the
 * provider. No USD anywhere — amounts are tokens.
 */

import { Button, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { MmIcon } from './mmIcon';
import { Switch } from './mmPrimitives';
import type {
    INextRun,
    IWorkbenchModel,
    IWorkbenchStats,
} from './workbenchModel';

interface IFlowSelectorProps {
    dao: string;
    flows: IWorkbenchModel['flows'];
    value: string | null;
    onChange: (id: string) => void;
}

export const FlowSelector: React.FC<IFlowSelectorProps> = (props) => {
    const { dao, flows, value, onChange } = props;
    const current = flows.find((f) => f.id === value) ?? flows[0];

    return (
        <Dropdown.Container
            align="start"
            constrainContentWidth={false}
            customTrigger={
                <Button
                    className="min-w-0 flex-1 justify-between"
                    iconLeft={IconType.APP_ASSETS}
                    iconRight={IconType.CHEVRON_DOWN}
                    size="md"
                    variant="secondary"
                >
                    <span className="truncate">
                        {current?.name ?? 'Select a flow'}
                    </span>
                </Button>
            }
        >
            <div className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[360px] max-w-[480px] p-1">
                <div className="px-2 pt-1 pb-2 font-semibold text-neutral-500 text-xs">
                    Flows · {dao}
                </div>
                {flows.map((f) => (
                    <Dropdown.Item
                        key={f.id}
                        onClick={() => onChange(f.id)}
                        selected={f.id === value}
                    >
                        {/* Dropdown.Item renders its children inside a <p>, so
                            every node here must be phrasing content — spans only,
                            no <div> or kit <Tag> (which renders its own <p>). */}
                        <span className="flex w-full items-center justify-between gap-3 py-0.5">
                            <span className="flex min-w-0 flex-col gap-0.5 text-left">
                                <span className="truncate font-semibold text-neutral-900 text-sm">
                                    {f.name}
                                </span>
                                <span className="truncate text-neutral-500 text-xs">
                                    {f.type} · {f.strategies}{' '}
                                    {f.strategies === 1
                                        ? 'strategy'
                                        : 'strategies'}
                                </span>
                            </span>
                            <span
                                className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 font-semibold text-xs ${
                                    f.status === 'live'
                                        ? 'bg-success-100 text-success-800'
                                        : 'bg-neutral-100 text-neutral-600'
                                }`}
                            >
                                {f.status}
                            </span>
                        </span>
                    </Dropdown.Item>
                ))}
            </div>
        </Dropdown.Container>
    );
};

export const CumulativeStats: React.FC<{ stats: IWorkbenchStats }> = ({
    stats,
}) => {
    // Three equal-weight KPIs (oracle-net pattern): dispatches, success rate
    // and how long the flow has been active. Per-token "moved / back" lives in
    // the TOKEN THROUGHPUT table below (out = moved, back = buybacks), which
    // scales to any token set — so we don't cram multi-token blobs here.
    const items: { label: string; value: string; accent?: boolean }[] = [
        {
            label: 'Dispatches',
            value: `${stats.dispatches}`,
        },
        {
            label: 'Success rate',
            value: `${Math.round(stats.successRate * 100)}%`,
            accent: true,
        },
        {
            label: 'Active since',
            value: `${stats.activeSinceDays}d`,
        },
    ];
    return (
        <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            {items.map((it) => (
                <div className="flex min-w-0 flex-col gap-px" key={it.label}>
                    <span className="font-semibold text-neutral-500 text-xs">
                        {it.label}
                    </span>
                    <span
                        className={`num break-words font-semibold text-base ${it.accent ? 'text-primary-600' : 'text-neutral-900'}`}
                    >
                        {it.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export const NextRunSummary: React.FC<{ nextRun: INextRun }> = ({
    nextRun,
}) => (
    <div className="flex min-w-0 flex-col gap-[3px]">
        <div className="flex items-center gap-[7px] text-neutral-600 text-sm">
            <MmIcon
                name="clock"
                size={16}
                style={{ color: 'var(--color-neutral-400)' }}
            />
            {nextRun.readyIn ? (
                <span>
                    Next run in{' '}
                    <strong className="num text-neutral-900">
                        {nextRun.readyIn}
                    </strong>
                </span>
            ) : (
                <span>Next run</span>
            )}
            {nextRun.epoch != null && (
                <>
                    <span className="inline-block size-[3px] rounded-full bg-neutral-300" />
                    <span>
                        epoch{' '}
                        <strong className="num text-neutral-900">
                            {nextRun.epoch.toLocaleString('en-US')}
                        </strong>
                    </span>
                </>
            )}
        </div>
    </div>
);

/**
 * Borderless "Auto" keeper toggle — sits next to the next-run / epoch line.
 * Disabled for now; hover explains the keeper service isn't available yet.
 */
export const AutoToggle: React.FC = () => (
    <div
        className="flex shrink-0 items-center gap-1.5"
        title="Auto-dispatch (keeper service) — not available yet"
    >
        <span className="font-semibold text-neutral-400 text-xs">Auto</span>
        <Switch disabled label="Auto-dispatch" on={false} />
    </div>
);

interface IDispatchControlsProps {
    /** Opens the simulate-&-dispatch modal (where the dispatch is confirmed). */
    onSimulate: () => void;
    /** False when the next dispatch would be a no-op (empty balances, same
     *  epoch, gate closed) — disables the button so you can't fire nothing. */
    canDispatch?: boolean;
    /** Tooltip explaining why dispatch is disabled. */
    dispatchReason?: string;
}

export const DispatchControls: React.FC<IDispatchControlsProps> = (props) => {
    const { onSimulate, canDispatch = true, dispatchReason } = props;
    // Simulate first (shows the plan + net outcome), then confirm the dispatch
    // from inside that modal. Disabled (reason on hover) when nothing would
    // move — a disabled <button> swallows hover, so the title lives on the
    // wrapper span. Full-width; the Demo button stacks beneath it.
    return (
        <span
            className="block"
            title={canDispatch ? undefined : dispatchReason}
        >
            <Button
                className="w-full"
                disabled={!canDispatch}
                onClick={onSimulate}
                size="md"
                variant="primary"
            >
                <span className="inline-flex items-center gap-2">
                    <MmIcon name="bolt" size={16} />
                    Simulate &amp; dispatch
                </span>
            </Button>
        </span>
    );
};

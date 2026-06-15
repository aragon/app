'use client';

/**
 * Workbench side/bottom panels: Inspector (selected-node live state), Legend
 * (node states + data fidelity), HistoryStrip (one row per dispatch run with
 * replay), ReplayBanner and the Simulate modal. All token-only, all driven by
 * the generic graph + view-model — nothing LMM-specific.
 */

import { Card, Dialog, Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { FlowFidelity, IFlowGraphNode } from '../../canvas/flowGraphTypes';
import {
    getRecipientDisplay,
    getSourceDisplay,
    getStrategyDisplay,
    getSubInputDisplay,
} from '../../canvas/primitiveRegistry';
import { MmIcon } from './mmIcon';
import { Amount, Pill } from './mmPrimitives';
import { MM_STATES, type MmTone, toneChip } from './tone';
import type {
    IHistoryLeg,
    IHistoryRun,
    INextRun,
    RunStatus,
} from './workbenchModel';

const truncateAddress = (address?: string): string =>
    address && address.length > 12
        ? `${address.slice(0, 6)}…${address.slice(-4)}`
        : (address ?? '');

/* ---------------------------------------------------------------- Inspector */

export interface IInspectorProps {
    node: IFlowGraphNode | null;
    recipient?: { label: string; address?: string };
    onClose: () => void;
}

const InspectorEmpty: React.FC = () => (
    <div className="flex flex-col items-center gap-1.5 px-2.5 py-[22px] text-center">
        <MmIcon
            name="app-dashboard"
            size={28}
            style={{ color: 'var(--color-neutral-300)' }}
        />
        <div className="font-semibold text-neutral-700">Select a node</div>
        <div className="max-w-[30ch] text-neutral-500 text-xs">
            Click any node on the canvas to read its live budget, gate, and
            epoch state.
        </div>
    </div>
);

const InspectorRow: React.FC<{
    icon: string;
    title: string;
    notes?: (string | undefined | false)[];
    mono?: boolean;
    value?: React.ReactNode;
}> = ({ icon, title, notes, mono, value }) => (
    <div className="flex items-center gap-2.5 border-neutral-100 border-t py-[9px]">
        <span className="flex shrink-0 text-neutral-400">
            <MmIcon name={icon} size={14} />
        </span>
        <div className="min-w-0 flex-1">
            <div
                className={classNames(
                    'font-semibold text-neutral-800 text-sm',
                    mono && 'mono',
                )}
            >
                {title}
            </div>
            {notes
                ?.filter((n): n is string => Boolean(n))
                .map((n) => (
                    <div className="mt-px text-neutral-500 text-xs" key={n}>
                        {n}
                    </div>
                ))}
        </div>
        {value != null && (
            <div className="flex shrink-0 flex-col items-end gap-0.5">
                {value}
            </div>
        )}
    </div>
);

const StrategyInspector: React.FC<{
    node: IFlowGraphNode;
    recipient?: { label: string; address?: string };
}> = ({ node, recipient }) => {
    const state = MM_STATES[node.state];
    const display = node.primitiveKind
        ? getStrategyDisplay(node.primitiveKind)
        : { icon: 'blockchain-smartcontract' };
    return (
        <div className="mt-1.5 flex flex-col gap-2">
            <div className="flex items-center gap-[11px]">
                <span
                    className={classNames(
                        'flex size-[38px] shrink-0 items-center justify-center rounded-xl',
                        toneChip[state.tone],
                    )}
                >
                    <MmIcon name={display.icon} size={18} />
                </span>
                <div>
                    <div className="mb-[3px] font-semibold text-base text-neutral-900">
                        {node.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <Pill tone={state.tone}>{state.label}</Pill>
                        {node.badge && (
                            <Pill tone={state.tone}>{node.badge}</Pill>
                        )}
                    </div>
                </div>
            </div>

            {node.inputs.length > 0 && (
                <div className="mt-2 font-semibold text-neutral-500 text-xs uppercase tracking-[0.06em]">
                    Inputs
                </div>
            )}
            {node.inputs.map((sub) => {
                const display = getSubInputDisplay(sub.role, sub.kind);
                const closed = sub.status === 'closed';
                return (
                    <InspectorRow
                        icon={display.icon}
                        key={`${sub.role}:${sub.kind}:${sub.label}`}
                        notes={[
                            sub.note,
                            sub.detail,
                            sub.epochLength &&
                                `epoch length ${sub.epochLength}`,
                        ]}
                        title={sub.label}
                        value={
                            <>
                                {sub.reading != null && (
                                    <Amount
                                        amount={sub.reading}
                                        token={sub.token}
                                    />
                                )}
                                {sub.status && (
                                    <Pill
                                        tone={closed ? 'critical' : 'success'}
                                    >
                                        {sub.status}
                                    </Pill>
                                )}
                                {sub.epoch != null && (
                                    <span className="num font-semibold text-neutral-700 text-sm">
                                        #{sub.epoch.toLocaleString('en-US')}
                                    </span>
                                )}
                            </>
                        }
                    />
                );
            })}

            {node.outputs && node.outputs.length > 0 && (
                <>
                    <div className="mt-2 font-semibold text-neutral-500 text-xs uppercase tracking-[0.06em]">
                        Output
                    </div>
                    {node.outputs.map((out) => (
                        <InspectorRow
                            icon={
                                out.toVault
                                    ? 'blockchain-wallet'
                                    : 'blockchain-block'
                            }
                            key={`${out.token}:${out.toLabel}`}
                            notes={[
                                out.toVault
                                    ? 'loops back to the DAO vault'
                                    : `sent to ${out.toLabel}${recipient?.address ? ` · ${truncateAddress(recipient.address)}` : ''}`,
                            ]}
                            title={out.toLabel}
                            value={
                                <Amount
                                    amount={out.amount}
                                    fidelity={out.fidelity}
                                    token={out.token}
                                />
                            }
                        />
                    ))}
                </>
            )}

            {node.params && node.params.length > 0 && (
                <>
                    <div className="mt-2 font-semibold text-neutral-500 text-xs uppercase tracking-[0.06em]">
                        Parameters
                    </div>
                    <div className="flex flex-col gap-1">
                        {node.params.map((p) => (
                            <div
                                className="flex items-center justify-between gap-3 text-sm"
                                key={p.label}
                            >
                                <span className="text-neutral-500">
                                    {p.label}
                                </span>
                                <span className="num font-semibold text-neutral-700">
                                    {p.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const EndpointInspector: React.FC<{ node: IFlowGraphNode }> = ({ node }) => {
    const isSource = node.kind === 'source';
    const display = isSource ? getSourceDisplay() : getRecipientDisplay();
    const tone: MmTone = isSource ? 'neutral' : 'primary';
    return (
        <div className="mt-1.5 flex flex-col gap-2">
            <div className="flex items-center gap-[11px]">
                <span
                    className={classNames(
                        'flex size-[38px] shrink-0 items-center justify-center rounded-xl',
                        toneChip[tone],
                    )}
                >
                    <MmIcon name={display.icon} size={18} />
                </span>
                <div>
                    <div className="mb-[3px] font-semibold text-base text-neutral-900">
                        {node.title}
                    </div>
                    <Pill tone={tone}>
                        {isSource ? 'Vault source' : 'Recipient'}
                    </Pill>
                </div>
            </div>

            {isSource && node.balances && node.balances.length > 0 && (
                <>
                    <div className="mt-2 font-semibold text-neutral-500 text-xs uppercase tracking-[0.06em]">
                        Balances
                    </div>
                    {node.balances.map((b) => (
                        <InspectorRow
                            icon="blockchain-wallet"
                            key={b.token}
                            title={b.token}
                            value={<Amount amount={b.amount} token={b.token} />}
                        />
                    ))}
                </>
            )}

            {!isSource && node.address && (
                <>
                    <div className="mt-2 font-semibold text-neutral-500 text-xs uppercase tracking-[0.06em]">
                        Address
                    </div>
                    <InspectorRow
                        icon="blockchain-block"
                        mono
                        title={truncateAddress(node.address)}
                    />
                </>
            )}
        </div>
    );
};

export const Inspector: React.FC<IInspectorProps> = (props) => {
    const { node, recipient, onClose } = props;
    return (
        <Card className="flex flex-col gap-1 border border-neutral-100 p-4">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-500 text-xs uppercase tracking-[0.06em]">
                    Inspector
                </span>
                {node && (
                    <button
                        className="flex size-[30px] items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                        onClick={onClose}
                        title="Clear selection"
                        type="button"
                    >
                        <MmIcon name="close" size={14} />
                    </button>
                )}
            </div>
            {!node && <InspectorEmpty />}
            {node?.kind === 'strategy' && (
                <StrategyInspector node={node} recipient={recipient} />
            )}
            {node && node.kind !== 'strategy' && (
                <EndpointInspector node={node} />
            )}
        </Card>
    );
};

/* ------------------------------------------------------------------- Legend */

const STATE_SWATCH: [label: string, className: string][] = [
    ['Accumulating', 'bg-info-500'],
    ['Firing', 'bg-primary-500'],
    ['Blocked', 'bg-critical-500'],
    ['Done', 'bg-success-600'],
    ['Failed', 'bg-critical-700'],
    ['Skipped', 'bg-neutral-300'],
];

export const Legend: React.FC = () => (
    <Card className="flex flex-col gap-3 border border-neutral-100 p-3.5">
        <div>
            <div className="mb-[7px] font-semibold text-neutral-500 text-xs uppercase tracking-[0.06em]">
                Node state
            </div>
            <div className="flex flex-wrap gap-x-3.5 gap-y-2">
                {STATE_SWATCH.map(([label, cls]) => (
                    <span
                        className="inline-flex items-center gap-1.5 text-neutral-600 text-xs"
                        key={label}
                    >
                        <span
                            className={classNames(
                                'size-2.5 rounded-[3px]',
                                cls,
                            )}
                        />
                        {label}
                    </span>
                ))}
            </div>
        </div>
        <div>
            <div className="mb-[7px] font-semibold text-neutral-500 text-xs uppercase tracking-[0.06em]">
                Data fidelity
            </div>
            <div className="flex flex-wrap gap-x-3.5 gap-y-2">
                <span className="inline-flex items-center gap-1.5 text-neutral-600 text-xs">
                    <span className="h-0 w-5 border-primary-400 border-t-[2.5px]" />
                    real
                </span>
                <span className="inline-flex items-center gap-1.5 text-neutral-600 text-xs">
                    <span className="h-0 w-5 border-info-500 border-t-[2.5px] border-dashed" />
                    ~ estimated
                </span>
                <span className="inline-flex items-center gap-1.5 text-neutral-600 text-xs">
                    <span className="h-0 w-5 border-primary-200 border-t-[2.5px] border-dotted" />
                    opaque
                </span>
            </div>
        </div>
    </Card>
);

/* ------------------------------------------------------------- HistoryStrip */

/** Static status indicator dot — green / amber / red, no full column. */
const RUN_STATUS_DOT: Record<RunStatus, string> = {
    ok: 'bg-success-500',
    partial: 'bg-warning-500',
    failed: 'bg-critical-500',
};

/** One run's legs as a compact plain-text summary (no tag blobs). */
const legSummary = (legs?: IHistoryLeg[]): string => {
    if (!legs || legs.length === 0) {
        return 'All legs ok';
    }
    return legs
        .map((lg) => {
            const detail = lg.detail ?? lg.reason;
            return detail ? `${lg.kind} ${detail}` : lg.kind;
        })
        .join(' · ');
};

export interface IHistoryStripProps {
    history: IHistoryRun[];
    activeRun: string | null;
    onSelect: (run: string) => void;
    /** When provided, renders a collapse chevron in the header (Focus layout). */
    onCollapse?: () => void;
}

export const HistoryStrip: React.FC<IHistoryStripProps> = (props) => {
    const { history, activeRun, onSelect, onCollapse } = props;
    return (
        <div className="flex max-h-[340px] min-h-0 flex-shrink-0 flex-col bg-neutral-0">
            <div className="flex flex-shrink-0 items-center justify-between px-[18px] py-3">
                <div className="flex items-center gap-2 font-semibold text-neutral-800 text-sm">
                    Dispatch history
                    <span className="rounded-full bg-neutral-100 px-[7px] py-px font-semibold text-neutral-500 text-xs">
                        {history.length}
                    </span>
                </div>
                {/* Exiting replay lives on the ReplayBanner ("Back to live") — no
                    duplicate control here. */}
                {onCollapse && (
                    <button
                        className="flex size-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                        onClick={onCollapse}
                        title="Collapse history"
                        type="button"
                    >
                        <MmIcon name="chevron-down" size={14} />
                    </button>
                )}
            </div>
            {history.length === 0 ? (
                <div className="p-[18px] text-neutral-500 text-sm">
                    No dispatches yet for this flow.
                </div>
            ) : (
                <div className="overflow-y-auto">
                    {/* Column header matches the cumulative table header style.
                        The replay column is an icon per row — no header label. */}
                    <div className="grid grid-cols-[64px_1fr_92px_120px_36px] items-center gap-4 px-5 py-2 text-neutral-400 text-xs">
                        <span>Run</span>
                        <span>Activity</span>
                        <span>When</span>
                        <span>Tx</span>
                        <span />
                    </div>
                    {history.map((h) => {
                        const isActive = activeRun === h.run;
                        return (
                            <div
                                className={classNames(
                                    'grid w-full grid-cols-[64px_1fr_92px_120px_36px] items-center gap-4 px-5 py-2.5 text-left',
                                    isActive
                                        ? 'bg-primary-50'
                                        : 'hover:bg-neutral-50',
                                )}
                                key={h.run}
                            >
                                <span className="flex items-center gap-2">
                                    <span
                                        className={classNames(
                                            'size-2 shrink-0 rounded-full',
                                            RUN_STATUS_DOT[h.status],
                                        )}
                                        title={h.status}
                                    />
                                    <span className="num font-semibold text-neutral-700 text-sm">
                                        {h.label}
                                    </span>
                                </span>
                                <span className="num min-w-0 truncate text-neutral-600 text-xs">
                                    {legSummary(h.legs)}
                                </span>
                                <span className="num text-neutral-500 text-xs">
                                    {h.at}
                                </span>
                                <button
                                    className="mono inline-flex min-w-0 items-center gap-1.5 text-primary-500 text-xs hover:text-primary-600 hover:underline"
                                    onClick={() => onSelect(h.run)}
                                    title="View transaction"
                                    type="button"
                                >
                                    <span className="truncate">{h.tx}</span>
                                    <Icon
                                        icon={IconType.LINK_EXTERNAL}
                                        size="sm"
                                    />
                                </button>
                                <button
                                    className={classNames(
                                        'flex items-center justify-end',
                                        isActive
                                            ? 'text-primary-500'
                                            : 'text-neutral-400 hover:text-primary-600',
                                    )}
                                    onClick={() => onSelect(h.run)}
                                    title={isActive ? 'Replaying' : 'Replay'}
                                    type="button"
                                >
                                    <MmIcon name="reload" size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* -------------------------------------------------------------- ReplayBanner */

export interface IReplayBannerProps {
    run: IHistoryRun;
    onClear: () => void;
}

export const ReplayBanner: React.FC<IReplayBannerProps> = ({
    run,
    onClear,
}) => (
    <div className="inline-flex items-center gap-[9px] rounded-full bg-primary-600 py-2 pr-2 pl-3.5 text-neutral-0 text-sm shadow-primary-lg">
        <MmIcon
            name="reload"
            size={15}
            style={{ color: 'rgba(255,255,255,.8)' }}
        />
        <span>
            Replaying dispatch{' '}
            <strong className="num font-semibold">{run.label}</strong> ·{' '}
            {run.at}
        </span>
        <button
            className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-2.5 py-[5px] font-semibold text-xs hover:bg-white/40"
            onClick={onClear}
            type="button"
        >
            <MmIcon name="close" size={12} />
            Back to live
        </button>
    </div>
);

/* -------------------------------------------------------------- SimulateModal */

const FidelityAmount: React.FC<{
    amount: number | null;
    token: string;
    fidelity?: FlowFidelity;
}> = ({ amount, token, fidelity }) => (
    <Amount amount={amount} fidelity={fidelity} token={token} />
);

export interface ISimulateModalProps {
    nextRun: INextRun;
    onClose: () => void;
    onDispatch: () => void;
    /** False disables the dispatch action (a no-op dispatch). */
    canDispatch?: boolean;
    /** Why dispatch is disabled, surfaced in the modal. */
    dispatchReason?: string;
    /** Demo mode: the fork RPC writes go to — shows a compact notice. */
    demoRpc?: string;
}

export const SimulateModal: React.FC<ISimulateModalProps> = (props) => {
    const {
        nextRun,
        onClose,
        onDispatch,
        canDispatch = true,
        dispatchReason,
        demoRpc,
    } = props;
    return (
        <Dialog.Root
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            open
        >
            <Dialog.Header onClose={onClose} title="Simulated next dispatch" />
            <Dialog.Content>
                <div className="text-neutral-600 text-sm">
                    {nextRun.summary}
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-neutral-500 text-sm">
                    {nextRun.readyIn && (
                        <span className="inline-flex items-center gap-1.5">
                            <MmIcon name="clock" size={14} />
                            ready in{' '}
                            <strong className="num text-neutral-800">
                                {nextRun.readyIn}
                            </strong>
                        </span>
                    )}
                    {nextRun.epoch != null && (
                        <>
                            <span className="inline-block size-[3px] rounded-full bg-neutral-300" />
                            <span>
                                epoch{' '}
                                <strong className="num text-neutral-800">
                                    {nextRun.epoch.toLocaleString('en-US')}
                                </strong>
                            </span>
                        </>
                    )}
                </div>

                <div className="mt-2.5 flex flex-col">
                    {nextRun.steps.map((s, i) => (
                        <div className="flex gap-3" key={s.kind}>
                            <div className="flex w-3.5 flex-shrink-0 flex-col items-center pt-1">
                                <span
                                    className={classNames(
                                        'size-[11px] flex-shrink-0 rounded-full',
                                        s.willFire
                                            ? 'bg-primary-500'
                                            : 'border-2 border-critical-400 bg-neutral-0',
                                    )}
                                />
                                {i < nextRun.steps.length - 1 && (
                                    <span className="my-[3px] min-h-[18px] w-0.5 flex-1 bg-neutral-200" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1 pb-4">
                                {/* No "will fire" badge for standard execution —
                                    the filled dot already signals it. Skips show
                                    a single inline alert below instead. */}
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <span className="font-semibold text-neutral-900 text-sm">
                                        {s.kind}
                                    </span>
                                </div>
                                {/* A firing step shows what moves; a skipped
                                    step shows only WHY (no opaque "on fill"
                                    placeholder amounts for something that won't
                                    run). */}
                                {s.willFire ? (
                                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                                        {s.ins.map((io) => (
                                            <FidelityAmount
                                                amount={io.amount}
                                                fidelity={io.fidelity}
                                                key={io.token}
                                                token={io.token}
                                            />
                                        ))}
                                        <MmIcon
                                            name="chevron-right"
                                            size={14}
                                            style={{
                                                color: 'var(--color-neutral-300)',
                                            }}
                                        />
                                        {s.outs.map((io) => (
                                            <FidelityAmount
                                                amount={io.amount}
                                                fidelity={io.fidelity}
                                                key={io.token}
                                                token={io.token}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-critical-100 px-2 py-0.5 font-semibold text-critical-700">
                                            <MmIcon name="critical" size={12} />
                                            Skipped
                                        </span>
                                        {s.skipReason && (
                                            <span className="text-neutral-500">
                                                {s.skipReason}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {nextRun.net.length > 0 && (
                    <div className="mt-1 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5">
                        <div className="mb-2 font-semibold text-neutral-500 text-xs uppercase tracking-[0.06em]">
                            Net to the DAO vault
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {nextRun.net.map((entry) => {
                                const positive = entry.delta >= 0;
                                const pending =
                                    entry.opaque && entry.delta === 0;
                                return (
                                    <div
                                        className="flex items-baseline justify-between gap-3"
                                        key={entry.token}
                                    >
                                        <span className="font-semibold text-neutral-600 text-sm">
                                            {entry.token}
                                        </span>
                                        {pending ? (
                                            <span className="font-semibold text-sm text-warning-700">
                                                on fill
                                            </span>
                                        ) : (
                                            <span
                                                className={classNames(
                                                    'num font-semibold text-sm',
                                                    positive
                                                        ? 'text-success-700'
                                                        : 'text-critical-700',
                                                )}
                                            >
                                                {positive ? '+' : '−'}
                                                {entry.opaque ? '~' : ''}
                                                {Math.abs(
                                                    entry.delta,
                                                ).toLocaleString('en-US', {
                                                    maximumFractionDigits: 4,
                                                })}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {!canDispatch && dispatchReason && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-neutral-100 px-2.5 py-2 text-neutral-600 text-xs">
                        <MmIcon name="info" size={14} />
                        <span>{dispatchReason}</span>
                    </div>
                )}
                {demoRpc && (
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-neutral-400">
                        <MmIcon name="info" size={11} />
                        <span>
                            Demo mode — dispatches to the fork ({demoRpc}). No
                            real funds move.
                        </span>
                    </div>
                )}
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: 'Dispatch now',
                    disabled: !canDispatch,
                    onClick: () => {
                        onClose();
                        onDispatch();
                    },
                }}
                secondaryAction={{ label: 'Close', onClick: onClose }}
            />
        </Dialog.Root>
    );
};

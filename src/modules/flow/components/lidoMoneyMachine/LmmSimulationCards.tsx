'use client';

// Aragon-styled per-leg cards for the LMM dispatch dialog.
//
// Each step in the simulator's FlowGraph renders as a card with two columns
// (In / Out) plus a status chip — no before/after deltas, no green/red
// success/error tone (those carry no meaning when both columns are token
// movements).  Underneath the three cards we summarise the net effect on
// the DAO across all legs.

import { Card } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type {
    FlowGraph,
    Step,
    StepStatus,
    TokenInfo,
} from '@/shared/lidoPreview';
import { formatAmount, shortAddress } from './format';

export interface ILmmSimulationCardsProps {
    flow: FlowGraph;
    className?: string;
}

interface ITokenMove {
    /** Display label; for outbound transfers the recipient or the call's
     *  verb, for produces the call's verb prefixed with `+`. */
    label?: string;
    amount: bigint;
    token: TokenInfo;
    sign: '+' | '-';
}

const stepKindLabel = (kind: string): string => {
    switch (kind) {
        case 'strategy.dispatch.transfer':
            return 'Transfer';
        case 'strategy.dispatch.burn':
            return 'Burn';
        case 'strategy.dispatch.epoch-transfer':
            return 'Epoch transfer';
        case 'strategy.dispatch.lido.wrap':
            return 'Wrap · stETH → wstETH';
        case 'strategy.dispatch.lido.univ2-liquidity':
            return 'UniV2 LP · wstETH + LDO → LP';
        case 'strategy.dispatch.lido.gated-cowswap':
            return 'CowSwap · wstETH → LDO buyback';
        default:
            return kind;
    }
};

const statusChipClass = (status: StepStatus): string => {
    // Neutral palette only — no green/red tones, no warm tints.  Status is
    // a label, not a value judgement.
    switch (status) {
        case 'executed':
            return 'border-primary-200 bg-primary-50 text-primary-800';
        case 'no-op':
            return 'border-neutral-100 bg-neutral-50 text-neutral-600';
        case 'skipped-paused':
            return 'border-neutral-200 bg-neutral-50 text-neutral-700';
        case 'opaque':
        case 'downstream-opaque':
            return 'border-neutral-200 bg-neutral-0 text-neutral-700';
        default:
            return 'border-neutral-100 bg-neutral-0 text-neutral-700';
    }
};

const statusChipLabel = (status: StepStatus): string => {
    switch (status) {
        case 'executed':
            return 'Execute';
        case 'no-op':
            return 'No-op';
        case 'skipped-paused':
            return 'Skipped · paused';
        case 'opaque':
            return 'Opaque';
        case 'downstream-opaque':
            return 'Downstream opaque';
        default:
            return status;
    }
};

const stepMoves = (step: Step): { ins: ITokenMove[]; outs: ITokenMove[] } => {
    const ins: ITokenMove[] = [];
    const outs: ITokenMove[] = [];
    // ERC-20 transfers from DAO → recipient.
    for (const t of step.transfers) {
        outs.push({
            label: shortAddress(t.to),
            amount: t.amount,
            token: t.token,
            sign: '-',
        });
    }
    // External calls — consumes = "In" (sent to the contract), produces = "Out"
    // (returned to the DAO).
    for (const call of step.externalCalls) {
        const verb = call.description.split('(')[0] || 'call';
        for (const c of call.consumes) {
            ins.push({
                label: verb,
                amount: c.amount,
                token: c.token,
                sign: '-',
            });
        }
        for (const p of call.produces) {
            ins.push({
                label: `+${verb}`,
                amount: p.amount,
                token: p.token,
                sign: '+',
            });
        }
    }
    return { ins, outs };
};

export const LmmSimulationCards: React.FC<ILmmSimulationCardsProps> = ({
    flow,
    className,
}) => (
    <div className={classNames('flex flex-col gap-4', className)}>
        <ol className="flex flex-col gap-3 p-0">
            {flow.steps.map((step) => (
                <li className="list-none" key={step.index}>
                    <StepCard step={step} />
                </li>
            ))}
        </ol>
        <NetEffectCard flow={flow} />
    </div>
);

const StepCard: React.FC<{ step: Step }> = ({ step }) => {
    const { ins, outs } = stepMoves(step);
    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-4">
            <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-baseline gap-2">
                    <span className="inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded-md bg-neutral-100 px-1.5 font-mono font-semibold text-neutral-600 text-xs">
                        #{step.index}
                    </span>
                    <span className="font-semibold text-neutral-800 text-sm leading-tight">
                        {stepKindLabel(step.strategyRef.kind)}
                    </span>
                </div>
                <span
                    className={classNames(
                        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 font-semibold text-xs uppercase tracking-wide',
                        statusChipClass(step.status),
                    )}
                >
                    {statusChipLabel(step.status)}
                </span>
            </header>

            {step.reason && (
                <p className="font-normal text-neutral-500 text-xs italic leading-snug">
                    {step.reason}
                </p>
            )}

            {(ins.length > 0 || outs.length > 0) && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Column
                        moves={ins}
                        placeholder="—"
                        title="In · DAO sends"
                    />
                    <Column
                        moves={outs}
                        placeholder="—"
                        title="Out · DAO receives"
                    />
                </div>
            )}

            {ins.length === 0 &&
                outs.length === 0 &&
                step.status !== 'no-op' &&
                step.status !== 'skipped-paused' && (
                    <p className="font-normal text-neutral-500 text-xs italic">
                        No on-chain effects.
                    </p>
                )}
        </Card>
    );
};

const Column: React.FC<{
    title: string;
    moves: ITokenMove[];
    placeholder: string;
}> = ({ title, moves, placeholder }) => (
    <div className="flex flex-col gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
        <span className="font-semibold text-neutral-600 text-xs uppercase tracking-wide">
            {title}
        </span>
        {moves.length === 0 ? (
            <span className="font-normal text-neutral-400 text-sm">
                {placeholder}
            </span>
        ) : (
            <ul className="flex flex-col gap-1.5">
                {moves.map((m, i) => (
                    <li
                        key={`${m.token.address}-${m.sign}-${i}`}
                        className="flex items-center justify-between gap-2 font-normal text-neutral-700 text-sm"
                    >
                        <span className="flex items-baseline gap-1 tabular-nums">
                            <span className="text-neutral-500">{m.sign}</span>
                            <span className="font-semibold text-neutral-800">
                                {formatAmount(m.amount, m.token.decimals, 4)}
                            </span>
                            <span className="font-normal text-neutral-500">
                                {m.token.symbol ??
                                    shortAddress(m.token.address)}
                            </span>
                        </span>
                        {m.label && (
                            <span className="truncate font-normal text-neutral-500 text-xs">
                                {m.label}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        )}
    </div>
);

const NetEffectCard: React.FC<{ flow: FlowGraph }> = ({ flow }) => {
    const initial = new Map<string, { token: TokenInfo; amount: bigint }>();
    for (const b of flow.initialState.balances) {
        initial.set(b.token.address.toLowerCase(), {
            token: b.token,
            amount: b.amount,
        });
    }
    const final = new Map<string, { token: TokenInfo; amount: bigint }>();
    for (const b of flow.finalState.balances) {
        final.set(b.token.address.toLowerCase(), {
            token: b.token,
            amount: b.amount,
        });
    }
    const tokens = new Set<string>([...initial.keys(), ...final.keys()]);
    const rows: Array<{ token: TokenInfo; delta: bigint }> = [];
    for (const key of tokens) {
        const before = initial.get(key)?.amount ?? 0n;
        const after = final.get(key)?.amount ?? 0n;
        if (before === after) {
            continue;
        }
        const token = final.get(key)?.token ?? initial.get(key)!.token;
        rows.push({ token, delta: after - before });
    }
    if (rows.length === 0) {
        return null;
    }
    return (
        <Card className="flex flex-col gap-2 border border-neutral-100 p-4">
            <h4 className="font-semibold text-neutral-700 text-sm uppercase tracking-wide">
                Net effect on DAO
            </h4>
            <ul className="flex flex-col gap-1">
                {rows.map((r) => {
                    const isNeg = r.delta < 0n;
                    const absDelta = isNeg ? -r.delta : r.delta;
                    return (
                        <li
                            className="flex items-center justify-between gap-2 font-normal text-neutral-700 text-sm tabular-nums"
                            key={r.token.address.toLowerCase()}
                        >
                            <span className="font-semibold text-neutral-700">
                                {r.token.symbol ??
                                    shortAddress(r.token.address)}
                            </span>
                            <span className="font-semibold text-neutral-800">
                                {isNeg ? '−' : '+'}
                                {formatAmount(absDelta, r.token.decimals, 4)}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
};

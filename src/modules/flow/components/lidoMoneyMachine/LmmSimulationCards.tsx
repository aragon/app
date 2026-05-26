'use client';

// Aragon-styled stand-in for the vendored `StepsView` (`./StepsView.tsx`),
// which renders Jordi's raw `.step` / `.flow-source` / `.flow-branches` CSS
// classes from `lido/preview/ui`.  Same semantic content (per-leg status,
// transfers, external calls, token deltas) but drawn with the Tailwind +
// gov-ui-kit palette so it doesn't look like a foreign widget when embedded
// inside an Aragon `Dialog`.
//
// Kept colocated with the vendored UI so the import surface for callers is
// `@/modules/flow/components/lidoMoneyMachine/*` regardless of which view
// they pick.

import classNames from 'classnames';
import type {
    FlowGraph,
    Step,
    StepStatus,
    TokenBalance,
} from '@/shared/lidoPreview';
import { formatAmount, shortAddress } from './format';

export interface ILmmSimulationCardsProps {
    flow: FlowGraph;
    className?: string;
}

/** Vertical stack of per-strategy cards mirroring the on-chain dispatch. */
export const LmmSimulationCards: React.FC<ILmmSimulationCardsProps> = ({
    flow,
    className,
}) => {
    return (
        <ol
            className={classNames(
                'flex flex-col gap-3',
                // Reset the default ordered-list numbering — every card
                // already shows its own `#N` index, and the browser-rendered
                // marker would push the cards inward and look out of place
                // inside a flush Dialog body.
                'list-none p-0',
                className,
            )}
        >
            {flow.steps.map((step) => (
                <li key={step.index}>
                    <StepCard step={step} />
                </li>
            ))}
        </ol>
    );
};

// ---------------------------------------------------------------------------
// Status pill: maps the simulator's `StepStatus` onto the gov-ui-kit tone
// palette.  Pre-tense ("Execute") rather than past-tense ("Executed") because
// the modal is showing what *would* happen if the user confirms.
// ---------------------------------------------------------------------------

const STATUS_TONE: Record<
    StepStatus,
    { label: string; container: string; pill: string; border: string }
> = {
    executed: {
        label: 'Execute',
        container: 'bg-success-50',
        pill: 'bg-success-100 text-success-800',
        border: 'border-success-200',
    },
    'no-op': {
        label: 'No-op',
        container: 'bg-neutral-50',
        pill: 'bg-neutral-100 text-neutral-700',
        border: 'border-neutral-100',
    },
    'skipped-paused': {
        label: 'Skipped · paused',
        container: 'bg-warning-50',
        pill: 'bg-warning-100 text-warning-800',
        border: 'border-warning-200',
    },
    opaque: {
        label: 'Opaque',
        container: 'bg-warning-50',
        pill: 'bg-warning-100 text-warning-800',
        border: 'border-warning-200',
    },
    'downstream-opaque': {
        label: 'Downstream opaque',
        container: 'bg-warning-50',
        pill: 'bg-warning-100 text-warning-700',
        border: 'border-warning-200',
    },
};

const StepCard: React.FC<{ step: Step }> = ({ step }) => {
    const tone = STATUS_TONE[step.status];
    const hasAction =
        step.transfers.length > 0 || step.externalCalls.length > 0;

    return (
        <article
            className={classNames(
                'flex flex-col gap-3 rounded-xl border p-4',
                tone.container,
                tone.border,
            )}
        >
            <header className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded-md bg-neutral-0 px-1.5 font-mono font-semibold text-neutral-500 text-xs">
                        #{step.index}
                    </span>
                    <span className="min-w-0 truncate font-semibold text-neutral-800 text-sm leading-tight">
                        {strategyKindLabel(step.strategyRef.kind)}
                    </span>
                </div>
                <span
                    className={classNames(
                        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-semibold text-xs uppercase tracking-wide',
                        tone.pill,
                    )}
                >
                    {tone.label}
                </span>
            </header>

            {step.reason && (
                <p className="font-normal text-neutral-600 text-sm italic leading-snug">
                    {step.reason}
                </p>
            )}

            {hasAction && (
                <div className="flex flex-col gap-2 rounded-lg border border-neutral-100 bg-neutral-0 p-3">
                    <SourceRow step={step} />
                    <BranchList step={step} />
                </div>
            )}

            {!hasAction &&
                step.status !== 'no-op' &&
                step.status !== 'skipped-paused' && (
                    <p className="font-normal text-neutral-500 text-xs italic">
                        (no actions)
                    </p>
                )}

            {hasBalanceChange(step) && (
                <footer>
                    <BalanceDeltaTable
                        after={step.after.balances}
                        before={step.before.balances}
                    />
                </footer>
            )}
        </article>
    );
};

// ---------------------------------------------------------------------------
// Inline flow visualisation: where the value comes from (DAO budget) and the
// branches it fans out into (transfers / external-call consumes & produces).
// ---------------------------------------------------------------------------

const SourceRow: React.FC<{ step: Step }> = ({ step }) => {
    const { amount, token } = step.budget ?? {};
    return (
        <div className="flex items-baseline gap-2">
            <span className="inline-flex items-center gap-1.5 text-neutral-700">
                <span
                    aria-hidden={true}
                    className="inline-block size-1.5 rounded-full bg-primary-500"
                />
                <span className="font-semibold text-sm">DAO</span>
            </span>
            {amount !== undefined && token && (
                <span className="font-mono text-neutral-600 text-xs tabular-nums">
                    {formatAmount(amount, token.decimals, 4)}{' '}
                    <span className="text-neutral-500">
                        {token.symbol ?? ''}
                    </span>
                </span>
            )}
        </div>
    );
};

type Branch = {
    kind: 'transfer' | 'burn' | 'call' | 'produce';
    amount: string;
    token: string;
    target: string;
    sign?: '+' | '-';
};

/** Tone for each branch — mirrors the verb's semantics so a glance at the
 *  colour tells you whether the leg adds or removes value from the DAO. */
const BRANCH_TONE: Record<Branch['kind'], { label: string; sign: string }> = {
    transfer: { label: 'text-neutral-600', sign: 'text-neutral-500' },
    burn: { label: 'text-warning-700', sign: 'text-warning-700' },
    produce: { label: 'text-success-700', sign: 'text-success-700' },
    call: { label: 'text-neutral-600', sign: 'text-neutral-500' },
};

const BranchList: React.FC<{ step: Step }> = ({ step }) => {
    const branches = branchesForStep(step);
    if (branches.length === 0) {
        return null;
    }
    return (
        <ul className="flex flex-col gap-1 pl-3">
            {branches.map((b, i) => (
                <li
                    className="flex items-baseline gap-2 font-mono text-xs tabular-nums leading-tight"
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${b.kind}-${b.target}-${b.token}-${i}`}
                >
                    {/* Tree-ish prefix: a quiet `└─` glyph anchors each
                     *  branch to the source row above without leaning on
                     *  vendored CSS pseudo-elements. */}
                    <span
                        aria-hidden={true}
                        className="select-none text-neutral-300"
                    >
                        └─
                    </span>
                    <span
                        className={classNames(
                            'min-w-0 grow',
                            BRANCH_TONE[b.kind].label,
                        )}
                    >
                        {b.amount}
                        {b.token ? ` ${b.token}` : ''}
                    </span>
                    <span
                        className={classNames(
                            'shrink-0 font-sans text-neutral-500 text-xs not-italic',
                        )}
                    >
                        {b.target}
                    </span>
                </li>
            ))}
        </ul>
    );
};

function branchesForStep(step: Step): Branch[] {
    const out: Branch[] = [];
    for (const t of step.transfers) {
        out.push({
            kind: 'transfer',
            amount: formatAmount(t.amount, t.token.decimals, 4),
            token: t.token.symbol ?? '',
            target: shortAddress(t.to),
        });
    }
    for (const call of step.externalCalls) {
        // `description` looks like `wrap(...)`, `burn(...)`, etc — keep just
        // the verb for the inline label so the branch row stays compact.
        const verb = call.description.split('(')[0] || 'call';
        for (const c of call.consumes) {
            out.push({
                kind: verb === 'burn' ? 'burn' : 'call',
                amount: formatAmount(c.amount, c.token.decimals, 4),
                token: c.token.symbol ?? '',
                target: verb,
            });
        }
        for (const p of call.produces) {
            out.push({
                kind: 'produce',
                amount: `+${formatAmount(p.amount, p.token.decimals, 4)}`,
                token: p.token.symbol ?? '',
                target: verb,
                sign: '+',
            });
        }
        if (call.consumes.length === 0 && call.produces.length === 0) {
            out.push({
                kind: 'call',
                amount: '',
                token: '',
                target: call.description,
            });
        }
    }
    return out;
}

// ---------------------------------------------------------------------------
// Token-balance delta footer: `sym  before → after   ±delta`, one row per
// token whose balance actually moved.  Skip same-value rows so the user only
// sees what changed (mirrors the upstream behaviour from Jordi's UI).
// ---------------------------------------------------------------------------

const BalanceDeltaTable: React.FC<{
    before: TokenBalance[];
    after: TokenBalance[];
}> = ({ before, after }) => {
    const items = before.flatMap((b, i) => {
        const a = after[i];
        const afterAmount = a?.amount ?? b.amount;
        const delta = BigInt(afterAmount) - BigInt(b.amount);
        if (delta === 0n) {
            return [];
        }
        return [
            { token: b.token, before: b.amount, after: afterAmount, delta },
        ];
    });
    if (items.length === 0) {
        return null;
    }
    return (
        <dl className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-3 gap-y-1 border-neutral-100 border-t pt-2 font-mono text-xs tabular-nums">
            {items.map((it) => {
                const sym = it.token.symbol ?? shortAddress(it.token.address);
                const isNeg = it.delta < 0n;
                return (
                    <div
                        className="contents"
                        key={it.token.address.toLowerCase()}
                    >
                        <dt className="font-semibold text-neutral-700">
                            {sym}
                        </dt>
                        <dd className="text-neutral-500">
                            {formatAmount(it.before, it.token.decimals, 4)}{' '}
                            <span className="text-neutral-300">→</span>{' '}
                            {formatAmount(it.after, it.token.decimals, 4)}
                        </dd>
                        <dd
                            className={classNames(
                                'text-right font-semibold',
                                isNeg
                                    ? 'text-critical-700'
                                    : 'text-success-700',
                            )}
                        >
                            {it.delta > 0n ? '+' : ''}
                            {formatAmount(it.delta, it.token.decimals, 4)}
                        </dd>
                    </div>
                );
            })}
        </dl>
    );
};

function hasBalanceChange(step: Step): boolean {
    return step.before.balances.some((b, i) => {
        const a = step.after.balances[i];
        return a !== undefined && BigInt(a.amount) !== BigInt(b.amount);
    });
}

// ---------------------------------------------------------------------------
// Human label for the strategy kind.  Kept in sync with the corresponding
// switch in `StepsView.tsx`; any new strategy added in `@/shared/lidoPreview`
// should be added here too so the dialog doesn't fall back to raw kind ids.
// ---------------------------------------------------------------------------

function strategyKindLabel(kind: string): string {
    switch (kind) {
        case 'strategy.dispatch.transfer':
            return 'Transfer';
        case 'strategy.dispatch.burn':
            return 'Burn';
        case 'strategy.dispatch.epoch-transfer':
            return 'Epoch transfer';
        case 'strategy.dispatch.lido.wrap':
            return 'Lido · Wrap stETH → wstETH';
        case 'strategy.dispatch.lido.univ2-liquidity':
            return 'Lido · UniV2 LP';
        case 'strategy.dispatch.lido.gated-cow-swap':
            return 'Lido · Gated CoW swap';
        case 'strategy.unknown':
            return 'Unknown';
        default:
            return kind;
    }
}

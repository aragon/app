// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

// Card-strip view of the FlowGraph. Extracted from the original FlowView so
// it can sit alongside the graph view behind a tab switcher.

import type { FlowGraph, Step, TokenBalance } from '@/shared/lidoPreview';
import { formatAmount, shortAddress } from './format';

export function StepsView({ flow }: { flow: FlowGraph }) {
    return (
        <div className="flow-steps">
            {flow.steps.map((step) => (
                <StepCard key={step.index} step={step} />
            ))}
        </div>
    );
}

function StepCard({ step }: { step: Step }) {
    const hasAction =
        step.transfers.length > 0 || step.externalCalls.length > 0;

    return (
        <article className={`step step-${step.status}`}>
            <header className="step-head">
                <span className="step-index">#{step.index}</span>
                <span className="step-kind">
                    {strategyKindLabel(step.strategyRef.kind)}
                </span>
                <span className={`step-status step-status-${step.status}`}>
                    {stepStatusLabel(step.status)}
                </span>
            </header>

            {step.reason && <div className="step-reason">{step.reason}</div>}

            {hasAction && (
                <div className="step-flow">
                    <SourceRow step={step} />
                    <BranchList step={step} />
                </div>
            )}

            {!hasAction &&
                step.status !== 'no-op' &&
                step.status !== 'skipped-paused' && (
                    <div className="step-empty">(no actions)</div>
                )}

            {hasBalanceChange(step) && (
                <footer className="step-delta">
                    <BalanceDeltaList
                        after={step.after.balances}
                        before={step.before.balances}
                    />
                </footer>
            )}
        </article>
    );
}

function SourceRow({ step }: { step: Step }) {
    const { amount, token } = step.budget ?? {};
    return (
        <div className="flow-source">
            <span className="flow-node">
                <span aria-hidden className="flow-dot" />
                DAO
            </span>
            {amount !== undefined && token && (
                <span className="flow-amount-out">
                    {formatAmount(amount, token.decimals)} {token.symbol ?? ''}
                </span>
            )}
        </div>
    );
}

type Branch = {
    kind: 'transfer' | 'burn' | 'call' | 'produce';
    amount: string;
    token: string;
    target: string;
};

function BranchList({ step }: { step: Step }) {
    const branches = branchesForStep(step);
    if (branches.length === 0) {
        return null;
    }
    return (
        <ul className="flow-branches">
            {branches.map((b, i) => (
                <li key={i}>
                    <span className="flow-amount">
                        {b.amount}
                        {b.token ? ` ${b.token}` : ''}
                    </span>
                    <span className={`flow-target flow-target-${b.kind}`}>
                        {b.target}
                    </span>
                </li>
            ))}
        </ul>
    );
}

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

function BalanceDeltaList({
    before,
    after,
}: {
    before: TokenBalance[];
    after: TokenBalance[];
}) {
    // Only surface tokens whose amount actually moves. An unchanged
    // `X → X` line is just noise — the step header already shows the
    // strategy ran, and a same-value arrow buries the real deltas below.
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
        <>
            {items.map((it) => {
                const sym = it.token.symbol ?? shortAddress(it.token.address);
                return (
                    <div className="delta" key={it.token.address}>
                        <span className="delta-sym">{sym}</span>
                        <span className="delta-values">
                            <span>
                                {formatAmount(it.before, it.token.decimals, 4)}
                            </span>
                            <span className="delta-arrow">→</span>
                            <span>
                                {formatAmount(it.after, it.token.decimals, 4)}
                            </span>
                        </span>
                        <span
                            className={
                                it.delta < 0n ? 'delta-minus' : 'delta-plus'
                            }
                        >
                            {it.delta > 0n ? '+' : ''}
                            {formatAmount(it.delta, it.token.decimals, 4)}
                        </span>
                    </div>
                );
            })}
        </>
    );
}

function hasBalanceChange(step: Step): boolean {
    return step.before.balances.some((b, i) => {
        const a = step.after.balances[i];
        return a !== undefined && BigInt(a.amount) !== BigInt(b.amount);
    });
}

/** Forward-tense pill label for the simulated step — the modal shows what
 *  *would* happen if the user confirms, so past-tense "executed" reads as
 *  if it already ran. */
function stepStatusLabel(status: Step['status']): string {
    switch (status) {
        case 'executed':
            return 'execute';
        default:
            return status;
    }
}

function strategyKindLabel(kind: string): string {
    switch (kind) {
        case 'strategy.dispatch.transfer':
            return 'Transfer';
        case 'strategy.dispatch.burn':
            return 'Burn';
        case 'strategy.dispatch.epoch-transfer':
            return 'EpochTransfer';
        case 'strategy.unknown':
            return 'Unknown';
        default:
            return kind;
    }
}

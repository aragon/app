// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

// Live-status view.  Mirrors `just demo-status` but grouped into cards and
// without the awk-formatted ASCII boxes.  Data comes from `useStatus` —
// every value is a fresh on-chain read keyed by the inspected topology,
// plus a `simulate()` result that fuels the "next dispatch" card.

import type { ReactNode } from 'react';
import { formatAmount, shortAddress } from './format';
import type { StatusSnapshot, StatusState } from './useStatus';

export function StatusView({
    state,
    onRefresh,
}: {
    state: StatusState;
    onRefresh: () => void;
}) {
    if (state.kind === 'idle') {
        return <div className="hint">Inspecting…</div>;
    }
    if (state.kind === 'loading') {
        return <div className="hint">Loading live state…</div>;
    }
    if (state.kind === 'error') {
        return (
            <div className="error">
                Status fetch failed: {state.message}
                <div style={{ marginTop: 8 }}>
                    <button onClick={onRefresh} type="button">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const snap = state.snapshot;
    return (
        <div className="status">
            <div className="status-toolbar">
                <span className="status-meta">
                    @ block {snap.block.toString()} · LMM DAO{' '}
                    {shortAddress(snap.dao)}
                    {state.refreshing && (
                        <span className="status-refreshing">
                            {' '}
                            · refreshing…
                        </span>
                    )}
                    {state.refreshError && (
                        <span
                            className="status-refresh-error"
                            onClick={onRefresh}
                            role="button"
                            title={`${state.refreshError} (click to retry)`}
                        >
                            {' '}
                            · refresh failed
                        </span>
                    )}
                </span>
            </div>
            <div className="status-grid">
                <LmmDaoCard snap={snap} />
                {snap.lp && <LidoDaoCard snap={snap} />}
                <BudgetsCard snap={snap} />
                {snap.stream && <StreamCard snap={snap} />}
                {snap.gate && <GateCard snap={snap} />}
                {snap.cowSwap && <CowSwapCard snap={snap} />}
            </div>
        </div>
    );
}

// --- Cards -----------------------------------------------------------------

function Card({
    title,
    hint,
    children,
}: {
    title: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <article className="status-card">
            <header>
                <h4>{title}</h4>
                {hint && <span className="status-hint">{hint}</span>}
            </header>
            {children}
        </article>
    );
}

function LmmDaoCard({ snap }: { snap: StatusSnapshot }) {
    return (
        <Card hint={shortAddress(snap.dao)} title="LMM DAO">
            <dl className="kv">
                {snap.balances.map((b) => (
                    <Row
                        k={tokenName(b.token)}
                        key={b.token.address}
                        v={
                            <Amount
                                amount={b.amount}
                                decimals={b.token.decimals}
                                muted={b.amount === 0n}
                                token={b.token.symbol ?? null}
                            />
                        }
                    />
                ))}
            </dl>
        </Card>
    );
}

// The LP recipient on the demo deployment is the Lido Agent, so the LP
// tokens minted by UniV2 land in the Lido DAO's vault — not in the LMM.
// Surfacing them under a separate card keeps the LMM card honest about
// what the LMM actually holds.
function LidoDaoCard({ snap }: { snap: StatusSnapshot }) {
    const lp = snap.lp!;
    return (
        <Card hint="LP (UniV2 LDO/wstETH)" title="Lido DAO">
            {lp.pair ? (
                <dl className="kv">
                    <Row
                        k="Held"
                        v={
                            <Amount
                                amount={lp.recipientBalance}
                                decimals={18}
                                muted={lp.recipientBalance === 0n}
                                token="LP"
                            />
                        }
                    />
                </dl>
            ) : (
                <p className="muted balances-empty">
                    Pair not deployed yet — the strategy needs the pair to
                    exist.
                </p>
            )}
        </Card>
    );
}

function BudgetsCard({ snap }: { snap: StatusSnapshot }) {
    return (
        <Card
            hint="budget() reading for each strategy"
            title="Budgets per dispatch"
        >
            <dl className="kv">
                {snap.budgets.map((b, i) => (
                    <Row
                        k={
                            <span>
                                {b.label}{' '}
                                <span className="muted small">
                                    ({budgetKindShort(b.budgetKind)})
                                </span>
                            </span>
                        }
                        key={`${b.strategyAddress}-${i}`}
                        v={
                            <Amount
                                amount={b.amount}
                                decimals={b.token.decimals}
                                muted={b.amount === 0n}
                                token={b.token.symbol ?? null}
                            />
                        }
                    />
                ))}
            </dl>
        </Card>
    );
}

function StreamCard({ snap }: { snap: StatusSnapshot }) {
    const s = snap.stream!;
    return (
        <Card hint="StreamUntilBudget — operator-paced" title="Stream (wstETH)">
            <dl className="kv">
                <Row k="Token" v={tokenName(s.token)} />
                <Row
                    k="Current epoch"
                    v={<Mono>{s.currentEpoch.toString()}</Mono>}
                />
                <Row
                    k="Target epoch"
                    v={<Mono>{s.targetEpoch.toString()}</Mono>}
                />
                <Row
                    k="Remaining"
                    v={
                        <span>
                            <Mono>{s.remaining.toString()}</Mono> ep{' '}
                            <span className="muted small">
                                {s.remaining < BigInt(s.floorEpochs)
                                    ? '(below floor → constant drain)'
                                    : '(above floor → drain grows as epochs tick)'}
                            </span>
                        </span>
                    }
                />
                <Row k="Floor" v={<Mono>{s.floorEpochs} ep</Mono>} />
            </dl>
        </Card>
    );
}

function GateCard({ snap }: { snap: StatusSnapshot }) {
    const g = snap.gate!;
    // Staleness is decided by the gate against `block.timestamp`, not the
    // host wallclock — after a Warp the two diverge, and using Date.now()
    // here would tell the user "fresh" while the gate actually fails closed.
    const age =
        g.updatedAt !== null
            ? Math.max(0, Number(snap.blockTimestamp - g.updatedAt))
            : null;
    const stale =
        age !== null && g.maxStaleness > 0n && BigInt(age) > g.maxStaleness;
    // The oracle returns the price scaled to tokenB's decimals (USDC = 6 in
    // the demo: 3_000_000_000 reads "$3000.00").  We don't fetch TokenInfo
    // for tokenB at inspect time, so hardcode 6 here — TODO: generalise via
    // `erc20.decimals()` if a non-USDC pair ever ships.
    const PRICE_DECIMALS = 6;
    return (
        <Card hint="PriceFloorGate" title="Buyback gate">
            <dl className="kv">
                <Row
                    k="Status"
                    v={
                        <span
                            className={g.passes ? 'pill-open' : 'pill-closed'}
                        >
                            {g.passes ? 'open' : 'closed'}
                        </span>
                    }
                />
                <Row
                    k="Price"
                    v={
                        g.price !== null ? (
                            <span>
                                <Mono>
                                    {formatAmount(g.price, PRICE_DECIMALS)}
                                </Mono>{' '}
                                <span className="muted small">
                                    threshold{' '}
                                    <Mono>
                                        {formatAmount(
                                            g.threshold,
                                            PRICE_DECIMALS,
                                        )}
                                    </Mono>
                                </span>
                            </span>
                        ) : (
                            <span className="muted">unreadable</span>
                        )
                    }
                />
                <Row
                    k="Updated"
                    v={
                        age !== null ? (
                            <span className={stale ? 'warn' : undefined}>
                                {age}s ago{' '}
                                <span className="muted small">
                                    {stale
                                        ? '(stale — gate fails closed)'
                                        : `(stale at ${g.maxStaleness.toString()}s)`}
                                </span>
                            </span>
                        ) : (
                            <span className="muted">—</span>
                        )
                    }
                />
            </dl>
        </Card>
    );
}

function CowSwapCard({ snap }: { snap: StatusSnapshot }) {
    const cs = snap.cowSwap!;
    return (
        <Card
            hint={`settlement ${shortAddress(cs.settlement)}`}
            title="CowSwap"
        >
            <dl className="kv">
                <Row
                    k="Orders placed"
                    v={
                        cs.ordersPlaced !== null ? (
                            <Mono>{cs.ordersPlaced.toString()}</Mono>
                        ) : (
                            <span className="muted">—</span>
                        )
                    }
                />
                <Row
                    k="Allowance"
                    v={
                        <Amount
                            amount={cs.allowance}
                            decimals={cs.allowanceToken.decimals}
                            muted={cs.allowance === 0n}
                            token={cs.allowanceToken.symbol ?? null}
                        />
                    }
                />
            </dl>
        </Card>
    );
}

// --- Small UI atoms --------------------------------------------------------

function Row({ k, v }: { k: ReactNode; v: ReactNode }) {
    return (
        <>
            <dt>{k}</dt>
            <dd>{v}</dd>
        </>
    );
}

function Amount({
    amount,
    decimals,
    token,
    muted,
}: {
    amount: bigint;
    decimals: number | null;
    token: string | null;
    muted?: boolean;
}) {
    return (
        <span className={muted ? 'muted' : undefined}>
            <Mono>{formatAmount(amount, decimals, 4)}</Mono>
            {token && <span className="muted small"> {token}</span>}
        </span>
    );
}

function Mono({ children }: { children: ReactNode }) {
    return <code className="mono">{children}</code>;
}

function tokenName(t: { symbol: string | null; address: string }): string {
    return t.symbol ?? shortAddress(t.address);
}

function budgetKindShort(kind: string): string {
    switch (kind) {
        case 'budget.full':
            return 'Full';
        case 'budget.required':
            return 'Required';
        case 'budget.lido.stream-until':
            return 'Stream';
        case 'budget.unknown':
            return 'Unknown';
        default:
            return kind;
    }
}

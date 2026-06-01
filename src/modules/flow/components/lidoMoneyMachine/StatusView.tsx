// LMM_DEMO_HACK: live state column rendered as three plain `Card`s with
// white headers — no `Accordion`, no gradient, no resizable chrome.  The
// sidebar lives to the right of the topology graph and stays compact on
// large viewports.
//
// Production removal: drop this whole file with the rest of the LMM
// demo surface.  See docs/lido-mmd-status.md `live-snapshot-rpc` — the
// indexer-emitted snapshot entity will feed an equivalent gov-ui-kit
// Card cluster.

import { Card, DefinitionList } from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';
import { formatAmount, shortAddress } from './format';
import type { StatusSnapshot } from './useStatus';

export interface IStatusViewProps {
    snapshot?: StatusSnapshot;
}

// Compact grid: term column gets ~40% of the row, value column the rest.
// `text-xs` everywhere so the sidebar can host 12+ rows without dwarfing
// the topology column on the left.  `*:!whitespace-normal` lets long
// descriptions (settlement addr, price · threshold) wrap to two lines
// instead of being truncated to "ora...".
const ROW_PADDING =
    '!py-1.5 !px-3 !gap-x-3 !grid-cols-[minmax(7rem,2fr)_minmax(0,3fr)] !text-xs [&_dt]:!text-xs [&_dt]:leading-tight [&_dd]:!text-xs [&_dd]:leading-tight [&_p]:!whitespace-normal [&_p]:!text-[11px] [&_p]:!leading-snug';

export const StatusView: React.FC<IStatusViewProps> = ({ snapshot }) => {
    if (snapshot == null) {
        return (
            <div className="flex flex-col gap-2">
                <Card className="border border-neutral-100 px-3 py-2">
                    <p className="font-normal text-neutral-500 text-xs">
                        Loading live state…
                    </p>
                </Card>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-2">
            <SectionHeader
                subtitle={`block ${snapshot.block.toString()} · LMM DAO ${shortAddress(snapshot.dao)}`}
                title="Live state"
            />
            <SectionCard title="Balances">
                <BalancesSection snapshot={snapshot} />
            </SectionCard>
            <SectionCard title="Per-dispatch budgets">
                <BudgetsSection snapshot={snapshot} />
            </SectionCard>
            <SectionCard title="Execution conditions">
                <ConditionsSection snapshot={snapshot} />
            </SectionCard>
        </div>
    );
};

const SectionHeader: React.FC<{ title: string; subtitle: string }> = ({
    title,
    subtitle,
}) => (
    <div className="flex flex-col gap-0.5 px-1">
        <span className="font-semibold text-neutral-800 text-sm leading-tight">
            {title}
        </span>
        <span className="font-normal text-neutral-500 text-xs leading-tight">
            {subtitle}
        </span>
    </div>
);

const SectionCard: React.FC<{ title: string; children: ReactNode }> = ({
    title,
    children,
}) => (
    <Card className="flex flex-col overflow-hidden border border-neutral-100 bg-neutral-0">
        <header className="flex items-center justify-between gap-2 border-neutral-100 border-b bg-neutral-0 px-3 py-2">
            <span className="font-semibold text-neutral-700 text-xs uppercase leading-tight tracking-wide">
                {title}
            </span>
        </header>
        <div className="py-1">{children}</div>
    </Card>
);

// --- Sections --------------------------------------------------------------

const BalancesSection: React.FC<{ snapshot: StatusSnapshot }> = ({
    snapshot,
}) => (
    <DefinitionList.Container className="px-0">
        {snapshot.balances.map((b) => (
            <DefinitionList.Item
                className={ROW_PADDING}
                key={b.token.address}
                term={tokenName(b.token)}
            >
                <Amount
                    amount={b.amount}
                    decimals={b.token.decimals}
                    token={b.token.symbol ?? null}
                />
            </DefinitionList.Item>
        ))}
        {snapshot.lp && (
            <DefinitionList.Item className={ROW_PADDING} term="LP · UniV2">
                {snapshot.lp.pair ? (
                    <Amount
                        amount={snapshot.lp.recipientBalance}
                        decimals={18}
                        token="LP"
                    />
                ) : (
                    <span className="font-normal text-neutral-500 text-xs">
                        Pair not deployed yet
                    </span>
                )}
            </DefinitionList.Item>
        )}
    </DefinitionList.Container>
);

const BudgetsSection: React.FC<{ snapshot: StatusSnapshot }> = ({
    snapshot,
}) => (
    <DefinitionList.Container className="px-0">
        {snapshot.budgets.map((b, i) => (
            <DefinitionList.Item
                className={ROW_PADDING}
                description={budgetKindShort(b.budgetKind)}
                key={`${b.strategyAddress}-${i}`}
                term={b.label}
            >
                <Amount
                    amount={b.amount}
                    decimals={b.token.decimals}
                    token={b.token.symbol ?? null}
                />
            </DefinitionList.Item>
        ))}
        {snapshot.stream && (
            <DefinitionList.Item
                className={ROW_PADDING}
                description={`epoch ${snapshot.stream.currentEpoch.toString()} → ${snapshot.stream.targetEpoch.toString()}`}
                term="Stream rem."
            >
                <span className="font-mono text-neutral-800 text-xs tabular-nums">
                    {snapshot.stream.remaining.toString()} ep · floor{' '}
                    {snapshot.stream.floorEpochs}
                </span>
            </DefinitionList.Item>
        )}
    </DefinitionList.Container>
);

const ConditionsSection: React.FC<{ snapshot: StatusSnapshot }> = ({
    snapshot,
}) => {
    const items: ReactNode[] = [];
    if (snapshot.gate) {
        const g = snapshot.gate;
        const PRICE_DECIMALS = 6;
        const age =
            g.updatedAt !== null
                ? Math.max(0, Number(snapshot.blockTimestamp - g.updatedAt))
                : null;
        const stale =
            age !== null && g.maxStaleness > 0n && BigInt(age) > g.maxStaleness;
        items.push(
            <DefinitionList.Item
                className={ROW_PADDING}
                description={
                    g.price !== null
                        ? `price ${formatAmount(g.price, PRICE_DECIMALS)} · threshold ${formatAmount(g.threshold, PRICE_DECIMALS)}${stale ? ' · oracle stale' : ''}`
                        : 'oracle unreachable'
                }
                key="gate"
                term="Buyback gate"
            >
                <StatusPill on={g.passes} />
            </DefinitionList.Item>,
        );
        if (age !== null) {
            items.push(
                <DefinitionList.Item
                    className={ROW_PADDING}
                    description={`max staleness ${g.maxStaleness.toString()}s`}
                    key="gate-age"
                    term="Oracle age"
                >
                    <span className="font-mono text-neutral-800 text-xs tabular-nums">
                        {age}s ago
                    </span>
                </DefinitionList.Item>,
            );
        }
    }
    if (snapshot.cowSwap) {
        const cs = snapshot.cowSwap;
        items.push(
            <DefinitionList.Item
                className={ROW_PADDING}
                description={`settlement ${shortAddress(cs.settlement)}`}
                key="cowswap-orders"
                term="CowSwap orders"
            >
                <span className="font-mono text-neutral-800 text-xs tabular-nums">
                    {cs.ordersPlaced !== null
                        ? cs.ordersPlaced.toString()
                        : '—'}
                </span>
            </DefinitionList.Item>,
            <DefinitionList.Item
                className={ROW_PADDING}
                key="cowswap-allowance"
                term="CowSwap allow."
            >
                <Amount
                    amount={cs.allowance}
                    decimals={cs.allowanceToken.decimals}
                    token={cs.allowanceToken.symbol ?? null}
                />
            </DefinitionList.Item>,
        );
    }
    if (items.length === 0) {
        return (
            <p className="px-3 py-2 font-normal text-neutral-500 text-xs">
                No execution conditions configured for this dispatcher.
            </p>
        );
    }
    return (
        <DefinitionList.Container className="px-0">
            {items}
        </DefinitionList.Container>
    );
};

// --- Atoms -----------------------------------------------------------------

const Amount: React.FC<{
    amount: bigint;
    decimals: number | null;
    token: string | null;
}> = ({ amount, decimals, token }) => (
    <span className="font-mono text-neutral-800 text-xs tabular-nums">
        {formatAmount(amount, decimals, 4)}
        {token && (
            <span className="ml-1 font-normal text-neutral-500">{token}</span>
        )}
    </span>
);

const StatusPill: React.FC<{ on: boolean }> = ({ on }) => (
    <span
        className={
            on
                ? 'inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-1.5 py-0 font-semibold text-[10px] text-primary-800 uppercase tracking-wide'
                : 'inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-1.5 py-0 font-semibold text-[10px] text-neutral-700 uppercase tracking-wide'
        }
    >
        {on ? 'open' : 'closed'}
    </span>
);

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

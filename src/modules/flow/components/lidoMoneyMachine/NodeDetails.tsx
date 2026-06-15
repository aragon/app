// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

import { type ReactNode, useEffect, useRef, useState } from 'react';
import type { GraphNode } from '@/shared/lidoPreview';
import { formatAmount, shortAddress } from './format';
import { CloseIcon } from './icons';
import type { StatusSnapshot } from './useStatus';

type TokenData = {
    address: string;
    symbol: string | null;
    decimals: number | null;
};

type RatioEntry = { recipient: string; ratio: number };

export function NodeDetails({
    node,
    status,
    onClose,
}: {
    node: GraphNode;
    status?: StatusSnapshot;
    onClose: () => void;
}) {
    return (
        <aside className="panel" onClick={(e) => e.stopPropagation()}>
            <header className="panel-header">
                <h3>{titleFor(node)}</h3>
                <button
                    aria-label="Close details"
                    className="panel-close"
                    onClick={onClose}
                    type="button"
                >
                    <CloseIcon />
                </button>
            </header>
            <dl className="panel-fields">{renderRows(node, status)}</dl>
        </aside>
    );
}

// --- Layout helpers --------------------------------------------------------

function Row({ label, v }: { label: string; v: ReactNode }) {
    return (
        <>
            <dt>{label}</dt>
            <dd>{v}</dd>
        </>
    );
}

function Addr({ a }: { a: string | null | undefined }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clear the timer if the component unmounts while the toast is showing.
    useEffect(
        () => () => {
            if (timer.current) {
                clearTimeout(timer.current);
            }
        },
        [],
    );

    if (!a) {
        return <span className="panel-na">—</span>;
    }

    function onClick() {
        void navigator.clipboard?.writeText(a!);
        setCopied(true);
        if (timer.current) {
            clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => setCopied(false), 1800);
    }

    return (
        <span className="panel-addr-wrap">
            <button className="panel-addr" onClick={onClick} type="button">
                <code>{shortAddress(a)}</code>
            </button>
            {copied && (
                <span className="panel-addr-toast" role="status">
                    <span className="panel-addr-toast-label">Copied</span>
                    <code>{a}</code>
                </span>
            )}
        </span>
    );
}

function Mono({ children }: { children: ReactNode }) {
    return <code className="panel-mono">{children}</code>;
}

function tokenLabel(t: TokenData): string {
    if (!t) {
        return '?';
    }
    const sym = t.symbol ?? shortAddress(t.address);
    const dec = t.decimals !== null ? ` (${t.decimals} decimals)` : '';
    return `${sym}${dec}`;
}

function FailsafeDecoded({
    bitmap,
    count,
}: {
    bitmap: unknown;
    count: unknown;
}) {
    const bi = toBigInt(bitmap);
    const n = typeof count === 'number' ? count : Number(count ?? 0);

    if (bi === null) {
        return <span className="panel-na">—</span>;
    }
    if (bi === 0n) {
        return <span>none</span>;
    }
    if (n > 0 && bi === (1n << BigInt(n)) - 1n) {
        return (
            <span>
                all <span className="panel-subtle">({n})</span>
            </span>
        );
    }

    const indices: number[] = [];
    const bitWidth = Math.max(n, bi.toString(2).length);
    for (let i = 0; i < bitWidth; i++) {
        if ((bi & (1n << BigInt(i))) !== 0n) {
            indices.push(i);
        }
    }
    return <span>{indices.map((i) => `#${i}`).join(', ')}</span>;
}

function toBigInt(raw: unknown): bigint | null {
    if (raw === null || raw === undefined) {
        return null;
    }
    if (typeof raw === 'bigint') {
        return raw;
    }
    try {
        return BigInt(String(raw));
    } catch {
        return null;
    }
}

// --- Per-kind rendering ----------------------------------------------------

function titleFor(node: GraphNode): string {
    switch (node.type) {
        case 'plugin.dispatch':
            return 'Dispatcher plugin';
        case 'plugin.unknown':
            return 'Unknown plugin';
        case 'dao':
            return 'LMM DAO';
        case 'lido-dao':
            return 'Lido DAO';
        case 'strategy.dispatch.transfer':
            return 'Transfer strategy';
        case 'strategy.dispatch.burn':
            return 'Burn strategy';
        case 'strategy.dispatch.epoch-transfer':
            return 'Epoch-transfer strategy';
        case 'strategy.dispatch.lido.wrap':
            return 'Wrap strategy (Lido)';
        case 'strategy.dispatch.lido.univ2-liquidity':
            return 'UniV2 add-liquidity (Lido)';
        case 'strategy.dispatch.lido.gated-cowswap':
            return 'Gated CowSwap (Lido)';
        case 'strategy.unknown':
            return 'Unknown strategy';
        case 'budget.full':
            return 'Full budget';
        case 'budget.required':
            return 'Required budget';
        case 'budget.lido.stream-until':
            return 'Stream-until budget (Lido)';
        case 'budget.unknown':
            return 'Unknown budget';
        case 'splitter.solo':
            return 'Solo splitter';
        case 'splitter.equal':
            return 'Equal splitter';
        case 'splitter.ratio':
            return 'Ratio splitter';
        case 'splitter.unknown':
            return 'Unknown splitter';
        case 'lido.price-floor-gate':
            return 'Price-floor gate (Lido)';
        case 'epoch-provider':
            return 'Epoch provider';
        case 'recipient':
            return 'Recipient';
        default:
            return node.type;
    }
}

function renderRows(node: GraphNode, status?: StatusSnapshot): ReactNode {
    const d = node.data as Record<string, unknown>;
    const rows: ReactNode[] = [];
    const push = (label: string, v: ReactNode) =>
        rows.push(<Row key={rows.length} label={label} v={v} />);

    // Every node has an address
    if (typeof d.address === 'string') {
        push('Address', <Addr a={d.address} />);
    }

    switch (node.type) {
        case 'dao': {
            // For the DAO node, show whatever token balances the status snapshot
            // has fetched.  If status isn't loaded yet (user hit Inspect but
            // hasn't opened Status), surface a hint instead.
            if (!status) {
                push(
                    'Balances',
                    <span className="panel-na">
                        open the Status panel to fetch live balances
                    </span>,
                );
                break;
            }
            const daoLower = (d.address as string).toLowerCase();
            if (status.dao.toLowerCase() !== daoLower) {
                push(
                    'Balances',
                    <span className="panel-na">
                        DAO in topology differs from the status snapshot
                    </span>,
                );
                break;
            }
            for (const b of status.balances) {
                push(
                    b.token.symbol ?? shortAddress(b.token.address),
                    <Mono>
                        {formatAmount(b.amount, b.token.decimals)}{' '}
                        {b.token.symbol ?? ''}
                    </Mono>,
                );
            }
            break;
        }

        case 'lido-dao': {
            // The Lido DAO (Lido Agent) owns the LMM and is the lpRecipient on
            // the UniV2 strategy, so its LP balance is the one position we can
            // surface here directly from the status snapshot.
            if (!status?.lp?.pair) {
                push(
                    'LP',
                    <span className="panel-na">
                        pair not deployed — LP appears once UniV2 fires
                    </span>,
                );
                break;
            }
            push(
                'LP held',
                <Mono>{formatAmount(status.lp.recipientBalance, 18)} LP</Mono>,
            );
            break;
        }

        case 'plugin.dispatch':
            push('Plugin ID', <Mono>{String(d.pluginId)}</Mono>);
            push('DAO', <Addr a={d.dao as string} />);
            push('Strategies', String(d.strategyCount));
            push(
                'Failsafe',
                <FailsafeDecoded
                    bitmap={d.failsafeStrategyMap}
                    count={d.strategyCount}
                />,
            );
            break;

        case 'plugin.unknown':
            push('Plugin ID', <Mono>{String(d.pluginId ?? '—')}</Mono>);
            if (d.dao) {
                push('DAO', <Addr a={d.dao as string} />);
            }
            break;

        case 'strategy.dispatch.transfer':
            push('Strategy ID', <Mono>{String(d.strategyId)}</Mono>);
            push('Paused', d.paused ? 'yes' : 'no');
            push('Use safe transfer', d.useSafeTransfer ? 'yes' : 'no');
            break;

        case 'strategy.dispatch.burn':
            push('Strategy ID', <Mono>{String(d.strategyId)}</Mono>);
            push('Paused', d.paused ? 'yes' : 'no');
            break;

        case 'strategy.dispatch.epoch-transfer':
            push('Strategy ID', <Mono>{String(d.strategyId)}</Mono>);
            push('Paused', d.paused ? 'yes' : 'no');
            push('Use safe transfer', d.useSafeTransfer ? 'yes' : 'no');
            push('Last dispatched epoch', String(d.lastDispatchedEpoch));
            break;

        case 'strategy.dispatch.lido.wrap':
            push('Strategy ID', <Mono>{String(d.strategyId)}</Mono>);
            push('Paused', d.paused ? 'yes' : 'no');
            push('Target wstETH', <Addr a={d.wstETH as string} />);
            break;

        case 'strategy.dispatch.lido.univ2-liquidity':
            push('Strategy ID', <Mono>{String(d.strategyId)}</Mono>);
            push('Paused', d.paused ? 'yes' : 'no');
            push('Router', <Addr a={d.router as string} />);
            push('Oracle', <Addr a={d.oracle as string} />);
            push('LP recipient', <Addr a={d.lpRecipient as string} />);
            push(
                'Max slippage',
                `${(Number(d.maxSlippageBps) / 100).toFixed(2)}%`,
            );
            push('Max staleness', `${String(d.maxStaleness)}s`);
            push('Last epoch fired', String(d.lastEpoch));
            break;

        case 'strategy.dispatch.lido.gated-cowswap': {
            const t = d.targetToken as TokenData;
            push('Strategy ID', <Mono>{String(d.strategyId)}</Mono>);
            push('Paused', d.paused ? 'yes' : 'no');
            push('Target token', tokenLabel(t));
            push('Target token address', <Addr a={t.address} />);
            push(
                'CowSwap settlement',
                <Addr a={d.cowSwapSettlement as string} />,
            );
            push('Price oracle', <Addr a={d.priceOracle as string} />);
            push(
                'Max slippage',
                `${(Number(d.maxSlippageBps) / 100).toFixed(2)}%`,
            );
            push('Max staleness', `${String(d.maxStaleness)}s`);
            push('Safe approval', d.useSafeApproval ? 'yes' : 'no');
            push('Last epoch fired', String(d.lastEpoch));
            break;
        }

        case 'strategy.unknown':
            push('Strategy ID', <Mono>{String(d.strategyId)}</Mono>);
            push('Paused', d.paused ? 'yes' : 'no');
            break;

        case 'budget.full': {
            const t = d.token as TokenData;
            push('Budget ID', <Mono>{String(d.budgetId)}</Mono>);
            push('Vault', <Addr a={d.vault as string} />);
            push('Token', tokenLabel(t));
            push('Token address', <Addr a={t.address} />);
            break;
        }

        case 'budget.required': {
            const t = d.token as TokenData;
            push('Budget ID', <Mono>{String(d.budgetId)}</Mono>);
            push('Vault', <Addr a={d.vault as string} />);
            push('Token', tokenLabel(t));
            push('Token address', <Addr a={t.address} />);
            push(
                'Required amount',
                <Mono>
                    {formatAmount(
                        d.requiredAmount as bigint | string,
                        t.decimals,
                    )}{' '}
                    {t.symbol ?? ''}
                </Mono>,
            );
            break;
        }

        case 'budget.lido.stream-until': {
            const t = d.token as TokenData;
            push('Budget ID', <Mono>{String(d.budgetId)}</Mono>);
            push('Vault', <Addr a={d.vault as string} />);
            push('Token', tokenLabel(t));
            push('Token address', <Addr a={t.address} />);
            push('Target epoch', String(d.targetEpoch));
            push('Floor epochs', String(d.floorEpochs));
            break;
        }

        case 'budget.unknown': {
            const t = d.token as TokenData;
            push('Budget ID', <Mono>{String(d.budgetId)}</Mono>);
            push('Token', tokenLabel(t));
            break;
        }

        case 'lido.price-floor-gate':
            push('Vault', <Addr a={d.vault as string} />);
            push('Oracle', <Addr a={d.oracle as string} />);
            push('Sell token', <Addr a={d.tokenA as string} />);
            push('Buy token', <Addr a={d.tokenB as string} />);
            push('Threshold', <Mono>{String(d.threshold)}</Mono>);
            push('Max staleness', `${String(d.maxStaleness)}s`);
            break;

        case 'splitter.solo':
            push('Splitter ID', <Mono>{String(d.splitterId)}</Mono>);
            push('Recipient', <Addr a={d.recipient as string} />);
            break;

        case 'splitter.equal': {
            const recipients = (d.recipients as string[]) ?? [];
            push('Splitter ID', <Mono>{String(d.splitterId)}</Mono>);
            push('Recipients', String(recipients.length));
            push(
                'Allocation',
                <ul className="panel-list">
                    {recipients.map((r, i) => (
                        <li key={i}>
                            <Addr a={r} />
                            <span className="panel-ratio">
                                {recipients.length > 0
                                    ? `${(100 / recipients.length).toFixed(2)}%`
                                    : ''}
                            </span>
                        </li>
                    ))}
                </ul>,
            );
            break;
        }

        case 'splitter.ratio': {
            const entries = (d.entries as RatioEntry[]) ?? [];
            push('Splitter ID', <Mono>{String(d.splitterId)}</Mono>);
            push('Recipients', String(entries.length));
            push(
                'Allocation',
                <ul className="panel-list">
                    {entries.map((e, i) => (
                        <li key={i}>
                            <Addr a={e.recipient} />
                            <span className="panel-ratio">
                                {(e.ratio / 10_000).toFixed(2)}%
                            </span>
                        </li>
                    ))}
                </ul>,
            );
            break;
        }

        case 'splitter.unknown':
            push('Splitter ID', <Mono>{String(d.splitterId)}</Mono>);
            break;

        case 'epoch-provider':
            push('Current epoch', String(d.currentEpoch));
            break;

        case 'recipient':
            // Address is already in the common section
            break;

        default:
            break;
    }

    return <>{rows}</>;
}

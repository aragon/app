'use client';

import { Button } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Link from 'next/link';
import { useFlowDataContext } from '../../providers/flowDataProvider';
import type {
    IFlowEmbeddedStrategy,
    IFlowOrchestrator,
    IFlowOrchestratorLeg,
    IFlowOrchestratorRun,
} from '../../types';
import {
    formatFlowAmount,
    formatRelative,
    formatShortDate,
} from '../../utils/flowFormatters';
import {
    FlowStatusDot,
    FlowStrategyChip,
    FlowTokenChip,
    FlowWaitingForIndexerBadge,
} from '../flowPrimitives';

export interface IFlowMultiDispatchCardProps {
    orchestrator: IFlowOrchestrator;
    network: string;
    addressOrEns: string;
    className?: string;
}

const cardBorderByStatus: Record<IFlowOrchestrator['status'], string> = {
    ready: 'border-primary-200',
    // Live cards used `border-success-200` (mint).  Neutral keeps the card
    // grid quiet; status colour lives only in the `FlowStatusDot`.
    live: 'border-neutral-200',
    cooldown: 'border-neutral-200',
    awaiting: 'border-neutral-200',
    paused: 'border-warning-300',
    never: 'border-neutral-100',
};

/**
 * Wide card rendering a Multi-dispatch orchestrator:
 * - Top: name / chain diagram (horizontal, each chip links to the child policy detail).
 * - Bottom: up to 4 most-recent runs, grouped by txHash, with a vertical leg list.
 *
 * Orchestrator dispatch is proxied to `dispatchPolicy(orchestrator.id)` — the existing
 * mock/live pipeline treats the id like a regular plugin, which is enough for the POC.
 */
export const FlowMultiDispatchCard: React.FC<IFlowMultiDispatchCardProps> = (
    props,
) => {
    const { orchestrator, network, addressOrEns, className } = props;
    const editHref = `/dao/${network}/${addressOrEns}/settings/automations/${orchestrator.address}`;
    // Orchestrators resolve through `data.orchestratorPolicies` on the policy
    // detail route, which renders the rich `LmmPolicyTopology` graph + chart +
    // history.  See `IFlowDaoData.orchestratorPolicies` for the lookup contract.
    const detailHref = `/dao/${network}/${addressOrEns}/flow/policies/${encodeURIComponent(
        orchestrator.id,
    )}`;

    const { dispatchPolicy, getPendingDispatch } = useFlowDataContext();
    const pendingDispatch = getPendingDispatch(orchestrator.id);
    const isDispatching = pendingDispatch != null;
    const isArchived = orchestrator.status === 'paused';
    const hasEmbedded = (orchestrator.embeddedStrategies?.length ?? 0) > 0;
    const hasChain =
        hasEmbedded || orchestrator.chain.some((child) => child != null);

    const handleDispatch = () => {
        dispatchPolicy(orchestrator.id);
    };

    // Orchestrators typically have many legs × many runs, which used to bloat the card well
    // past a policy card's height. We cap the in-card history at the 2 most recent runs;
    // older runs are collapsed behind a "+N older runs" counter (non-clickable for now).
    const MAX_VISIBLE_RUNS = 2;
    const visibleRuns = orchestrator.runs.slice(0, MAX_VISIBLE_RUNS);
    const hiddenRunsCount = Math.max(
        0,
        orchestrator.runs.length - visibleRuns.length,
    );

    return (
        <article
            // `h-full` + `mt-auto` on the footer aligns the dispatch CTA across cards in a
            // row regardless of how much history each orchestrator has rendered above.
            className={classNames(
                'flex h-full flex-col gap-3 rounded-xl border bg-neutral-0 p-4 shadow-neutral-sm md:p-5',
                cardBorderByStatus[orchestrator.status],
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <Link
                    aria-label={`Open ${orchestrator.name} detail page`}
                    className="-mx-1 -my-0.5 flex min-w-0 flex-col gap-1 rounded-md px-1 py-0.5 hover:bg-neutral-50"
                    href={detailHref}
                >
                    <div className="flex items-center gap-2">
                        <FlowStatusDot status={orchestrator.status} />
                        <h3 className="truncate font-semibold text-base text-neutral-800 leading-tight hover:text-primary-500">
                            {orchestrator.name}
                        </h3>
                    </div>
                    <p className="line-clamp-2 font-normal text-neutral-500 text-sm leading-snug">
                        {orchestrator.description}
                    </p>
                </Link>
                <div className="flex flex-col items-end gap-1.5">
                    <FlowStrategyChip strategy={orchestrator.strategy} />
                    {/* Quiet text link instead of an outlined pill — the chip
                     *  next to it (when present) already carries the visual
                     *  weight, and a second rounded shape next to it read as
                     *  noise on the card header. */}
                    <Link
                        aria-label={`Edit ${orchestrator.name} in DAO settings`}
                        className="inline-flex items-center gap-1 font-normal text-neutral-500 text-xs leading-tight hover:text-primary-500"
                        href={editHref}
                        rel="noopener"
                        target="_blank"
                    >
                        Edit ↗
                    </Link>
                </div>
            </div>

            {hasEmbedded ? (
                <FlowEmbeddedChainDiagram
                    addressOrEns={addressOrEns}
                    network={network}
                    orchestratorId={orchestrator.id}
                    strategies={orchestrator.embeddedStrategies ?? []}
                />
            ) : (
                <FlowChainDiagram
                    addressOrEns={addressOrEns}
                    network={network}
                    orchestrator={orchestrator}
                />
            )}

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-neutral-700 text-sm leading-tight">
                        Recent runs
                    </h3>
                    <span className="font-normal text-neutral-500 text-xs leading-tight">
                        {orchestrator.totalRuns === 0
                            ? 'Never dispatched'
                            : `${orchestrator.totalRuns} total`}
                    </span>
                </div>
                {orchestrator.runs.length === 0 ? (
                    <div className="rounded-lg border border-neutral-100 border-dashed px-3 py-3 text-center font-normal text-neutral-500 text-xs">
                        No dispatches yet — the chain above is configured but
                        hasn't been triggered.
                    </div>
                ) : (
                    <ul className="flex flex-col gap-1.5">
                        {visibleRuns.map((run) => (
                            <RunRow
                                addressOrEns={addressOrEns}
                                key={run.id}
                                network={network}
                                run={run}
                            />
                        ))}
                    </ul>
                )}
                {hiddenRunsCount > 0 && (
                    <span className="self-start font-normal text-neutral-500 text-xs leading-tight">
                        +{hiddenRunsCount} older run
                        {hiddenRunsCount === 1 ? '' : 's'}
                    </span>
                )}
            </div>

            {/* `mt-auto` pins the pending badge + CTA to the card bottom so cards line
                up in the grid regardless of how many runs each shows above. */}
            <div className="mt-auto flex flex-col gap-3">
                {pendingDispatch != null && (
                    <FlowWaitingForIndexerBadge
                        network={network}
                        pending={pendingDispatch}
                        variant="block"
                    />
                )}

                {isArchived ? (
                    <span className="inline-flex w-full items-center justify-center rounded-full bg-warning-100 px-3 py-1.5 font-semibold text-sm text-warning-800 leading-tight">
                        {orchestrator.uninstalledAt
                            ? `Archived · uninstalled ${formatRelative(orchestrator.uninstalledAt)}`
                            : 'Archived · uninstalled'}
                    </span>
                ) : (
                    <Button
                        className="w-full"
                        disabled={isDispatching || !hasChain}
                        onClick={handleDispatch}
                        size="md"
                        variant="primary"
                    >
                        {isDispatching ? 'Dispatching…' : 'Dispatch chain now'}
                    </Button>
                )}
            </div>
        </article>
    );
};

// ---------------------------------------------------------------------------
// Chain diagram
// ---------------------------------------------------------------------------

interface IFlowChainDiagramProps {
    orchestrator: IFlowOrchestrator;
    network: string;
    addressOrEns: string;
}

const FlowChainDiagram: React.FC<IFlowChainDiagramProps> = ({
    orchestrator,
    network,
    addressOrEns,
}) => {
    if (orchestrator.chain.length === 0) {
        return (
            <div className="rounded-lg border border-neutral-100 border-dashed px-3 py-3 font-normal text-neutral-500 text-sm">
                No sub-routers configured.
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            {orchestrator.chain.map((child, index) => (
                <ChainChip
                    addressOrEns={addressOrEns}
                    child={child}
                    key={`${child?.id ?? 'missing'}-${index}`}
                    network={network}
                    showArrow={index < orchestrator.chain.length - 1}
                />
            ))}
        </div>
    );
};

interface IChainChipProps {
    child: IFlowOrchestrator['chain'][number];
    network: string;
    addressOrEns: string;
    showArrow: boolean;
}

const ChainChip: React.FC<IChainChipProps> = ({
    child,
    network,
    addressOrEns,
    showArrow,
}) => {
    if (child == null) {
        return (
            <>
                <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 border-dashed bg-neutral-0 px-2 py-0.5 font-normal text-neutral-500 text-xs leading-tight">
                    Unknown sub-router
                </span>
                {showArrow && <ChainArrow />}
            </>
        );
    }
    const href = `/dao/${network}/${addressOrEns}/flow/policies/${child.id}`;
    return (
        <>
            <Link
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-100 bg-neutral-0 px-2 py-1 font-normal text-neutral-700 text-xs leading-tight hover:border-primary-200 hover:text-primary-400"
                href={href}
            >
                <span className="font-semibold">{child.strategy}</span>
                <span className="text-neutral-500">·</span>
                {child.swapPair ? (
                    <span className="inline-flex items-center gap-1 tabular-nums">
                        {child.swapPair.in}
                        <span className="text-neutral-400">→</span>
                        {child.swapPair.out}
                    </span>
                ) : (
                    <span>{child.token}</span>
                )}
            </Link>
            {showArrow && <ChainArrow />}
        </>
    );
};

const ChainArrow: React.FC = () => (
    <span aria-hidden={true} className="font-normal text-neutral-400 text-sm">
        →
    </span>
);

// ---------------------------------------------------------------------------
// Embedded-strategy chain (Dispatcher-owned strategies)
// ---------------------------------------------------------------------------

interface IFlowEmbeddedChainDiagramProps {
    strategies: IFlowEmbeddedStrategy[];
    /** Route base for the per-strategy deep-link.  Each chip routes to
     *  `/dao/{network}/{addressOrEns}/flow/policies/{orchestratorId}?node={strategyAddress}`
     *  so the dispatcher detail page can auto-select the matching topology
     *  node + open NodeDetails on it. */
    orchestratorId: string;
    network: string;
    addressOrEns: string;
}

/**
 * Render the dispatcher's embedded strategy chain.  Each chip exposes the
 * strategy kind + key per-leg chips: budget kind (Stream/Full),
 * gate kind (PriceFloor) and epoch length where present.  Falls through
 * gracefully when an LMM dispatcher hasn't finished initializing all of
 * its sub-components yet.
 */
const FlowEmbeddedChainDiagram: React.FC<IFlowEmbeddedChainDiagramProps> = ({
    strategies,
    orchestratorId,
    network,
    addressOrEns,
}) => (
    <div className="flex flex-wrap items-stretch gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
        {strategies.map((s, index) => (
            <EmbeddedStrategyChip
                addressOrEns={addressOrEns}
                key={s.id}
                network={network}
                orchestratorId={orchestratorId}
                showArrow={index < strategies.length - 1}
                strategy={s}
            />
        ))}
    </div>
);

// LMM_DEMO_HACK: STRATEGY_KIND_TONE used to ship per-kind pastel tints
// (`primary-50` wrap / `violet-50` UniV2 / `cyan-50` CowSwap).  We
// neutralized those so the embedded chain reads as a single chain of
// equal chips; the strategy *label* carries enough semantic weight
// without competing pastel backgrounds.
const STRATEGY_KIND_TONE: Record<IFlowEmbeddedStrategy['kind'], string> = {
    wrap: 'border-neutral-200 bg-neutral-0',
    univ2Liquidity: 'border-neutral-200 bg-neutral-0',
    gatedCowSwap: 'border-neutral-200 bg-neutral-0',
    cowSwap: 'border-neutral-200 bg-neutral-0',
    transfer: 'border-neutral-200 bg-neutral-0',
    epochTransfer: 'border-neutral-200 bg-neutral-0',
    burn: 'border-critical-200 bg-critical-50',
    unknown: 'border-neutral-200 bg-neutral-0',
};

const EmbeddedStrategyChip: React.FC<{
    strategy: IFlowEmbeddedStrategy;
    showArrow: boolean;
    orchestratorId: string;
    network: string;
    addressOrEns: string;
}> = ({ strategy, showArrow, orchestratorId, network, addressOrEns }) => {
    const seconds = strategy.epochProvider?.epochLength;
    const epochLabel = formatEpochLength(seconds);
    // Deep-link into the dispatcher detail page with the matching topology
    // node pre-selected.  The dispatcher page reads `?node=` via
    // `useSearchParams()` and threads the address down to TopologyView,
    // which opens NodeDetails on the matching node.  Strategy address is
    // the only stable identifier we can derive from the chip — topology
    // node ids are path-based and not user-meaningful.
    const href = `/dao/${network}/${addressOrEns}/flow/policies/${encodeURIComponent(
        orchestratorId,
    )}?node=${strategy.address}`;
    return (
        <>
            <Link
                aria-label={`Open ${strategy.label} in dispatcher topology`}
                className={classNames(
                    'flex flex-col gap-1 rounded-lg border px-2.5 py-1.5 text-xs transition-shadow hover:shadow-neutral-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200',
                    STRATEGY_KIND_TONE[strategy.kind],
                )}
                href={href}
            >
                <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-neutral-800 leading-tight">
                        {strategy.label}
                    </span>
                    {strategy.paused && (
                        <span className="inline-flex items-center rounded-full bg-warning-200 px-1.5 py-0 font-semibold text-[10px] text-warning-800 leading-tight">
                            Paused
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                    {strategy.budget && (
                        <span className="inline-flex items-center rounded-full border border-neutral-100 bg-neutral-0 px-1.5 py-0 font-normal text-[10px] text-neutral-600 leading-tight">
                            {strategy.budget.kind === 'streamUntil'
                                ? 'Stream'
                                : strategy.budget.kind === 'full'
                                  ? 'Full'
                                  : strategy.budget.kind === 'required'
                                    ? 'Required'
                                    : 'Budget'}
                        </span>
                    )}
                    {strategy.gate && (
                        <span className="inline-flex items-center rounded-full border border-neutral-100 bg-neutral-0 px-1.5 py-0 font-normal text-[10px] text-neutral-600 leading-tight">
                            {strategy.gate.kind === 'priceFloor'
                                ? 'PriceFloor'
                                : 'Gate'}
                        </span>
                    )}
                    {epochLabel && (
                        <span className="inline-flex items-center rounded-full border border-neutral-100 bg-neutral-0 px-1.5 py-0 font-normal text-[10px] text-neutral-600 leading-tight">
                            Epoch {epochLabel}
                        </span>
                    )}
                </div>
            </Link>
            {showArrow && <ChainArrow />}
        </>
    );
};

const formatEpochLength = (seconds?: string): string | undefined => {
    if (seconds == null) {
        return undefined;
    }
    const n = Number(seconds);
    if (!Number.isFinite(n) || n <= 0) {
        return undefined;
    }
    if (n >= 86_400) {
        const d = n / 86_400;
        return `${Number.isInteger(d) ? d : d.toFixed(1)}d`;
    }
    if (n >= 3600) {
        return `${Math.round(n / 3600)}h`;
    }
    return `${Math.round(n / 60)}m`;
};

// ---------------------------------------------------------------------------
// Run row (vertical list of legs)
// ---------------------------------------------------------------------------

interface IRunRowProps {
    run: IFlowOrchestratorRun;
    network: string;
    addressOrEns: string;
}

const RunRow: React.FC<IRunRowProps> = ({ run, network, addressOrEns }) => (
    <li className="rounded-lg border border-neutral-100 bg-neutral-0 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-neutral-700 text-sm leading-tight">
                {formatShortDate(run.at)}
            </span>
            <span className="font-normal text-neutral-500 text-xs tabular-nums leading-tight">
                {formatRelative(run.at)} · {run.txHash.slice(0, 10)}…
            </span>
        </div>
        <ul className="mt-1.5 flex flex-col gap-1">
            {run.legs.map((leg) => (
                <RunLeg
                    addressOrEns={addressOrEns}
                    key={`${leg.policyId}-${run.id}`}
                    leg={leg}
                    network={network}
                />
            ))}
        </ul>
    </li>
);

interface IRunLegProps {
    leg: IFlowOrchestratorLeg;
    network: string;
    addressOrEns: string;
}

const RunLeg: React.FC<IRunLegProps> = ({ leg, network, addressOrEns }) => {
    const href = `/dao/${network}/${addressOrEns}/flow/policies/${leg.policyId}`;
    const isFailed = leg.status === 'failed';
    const isSkipped = leg.status === 'skipped';
    return (
        <li className="flex items-center gap-2 text-sm">
            <span
                aria-hidden={true}
                className={classNames(
                    'size-1.5 shrink-0 rounded-full',
                    isFailed
                        ? 'bg-critical-500'
                        : isSkipped
                          ? 'bg-warning-500'
                          : 'bg-primary-400',
                )}
            />
            <Link
                className="min-w-0 truncate font-normal text-neutral-700 leading-tight hover:text-primary-400"
                href={href}
            >
                {leg.policyName}
            </Link>
            <span className="ml-auto flex items-center gap-1 font-normal text-neutral-500 tabular-nums leading-tight">
                {leg.amountIn != null && leg.tokenIn ? (
                    <>
                        <span>
                            {formatFlowAmount(leg.amountIn, leg.tokenIn)}
                        </span>
                        <FlowTokenChip
                            className="px-1 py-0 font-normal text-xs"
                            token={leg.tokenIn}
                        />
                        <span className="text-neutral-400">→</span>
                    </>
                ) : null}
                <span>{formatFlowAmount(leg.amountOut, leg.tokenOut)}</span>
                <FlowTokenChip
                    className="px-1 py-0 font-normal text-xs"
                    token={leg.tokenOut}
                />
                <span className="hidden text-neutral-400 sm:inline">·</span>
                <span className="hidden sm:inline">
                    {leg.recipientsCount === 0
                        ? 'No recipients'
                        : `${leg.recipientsCount} recipient${leg.recipientsCount === 1 ? '' : 's'}`}
                </span>
            </span>
        </li>
    );
};

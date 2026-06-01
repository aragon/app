'use client';

import { Button } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { FlowPolicyChart } from '../../components/flowPolicyChart/flowPolicyChart';
import { FlowPolicyHistory } from '../../components/flowPolicyHistory/flowPolicyHistory';
import { FlowPolicyStructure } from '../../components/flowPolicyStructure/flowPolicyStructure';
import {
    FlowStatusDot,
    FlowStrategyChip,
    FlowTokenChip,
    FlowWaitingForIndexerBadge,
} from '../../components/flowPrimitives';
import { FlowRecipientsTable } from '../../components/flowRecipientsTable/flowRecipientsTable';
import {
    FlowLoadError,
    FlowPolicyDetailPageSkeleton,
} from '../../components/flowSkeletons';
// LMM_DEMO_HACK: the policy header in demo mode exposes a "More actions ▾"
// dropdown that wraps the Anvil cheat actions (warp time, top up balances,
// etc).  Renders to `null` outside demo mode.
import { LmmCheatsMenu } from '../../components/lidoMoneyMachine/LmmCheatsMenu';
import { FlowDialogId } from '../../constants/flowDialogId';
import { LmmDemoBanner } from '../../demo/LmmDemoBanner';
import { LMM_DEMO_MODE } from '../../demo/lmmDemoConfig';
import { useIsLmmDispatcherPolicy } from '../../demo/useLmmManifest';
import type { IConfirmDispatchDialogParams } from '../../dialogs/confirmDispatchDialog';
import { useFlowDataContext } from '../../providers/flowDataProvider';
import type { IFlowPolicy } from '../../types';
import {
    formatFlowAmount,
    formatRelative,
    formatShortDate,
    isDispatchableStrategy,
} from '../../utils/flowFormatters';

export interface IFlowPolicyDetailPageClientProps {
    network: string;
    addressOrEns: string;
    policyId: string;
}

export const FlowPolicyDetailPageClient: React.FC<
    IFlowPolicyDetailPageClientProps
> = (props) => {
    const { network, addressOrEns, policyId } = props;
    const { data, dispatchPolicy, getPendingDispatch, isError, chainNowMs } =
        useFlowDataContext();
    const { open } = useDialogContext();
    const decodedPolicyId = decodeURIComponent(policyId);
    const base = `/dao/${network}/${addressOrEns}/flow`;

    // LMM_DEMO_HACK: chip clicks on the dashboard orchestrator card deep-link
    // here with `?node=<strategyAddress>`.  Pulled at this level so we can
    // both pass it down to `FlowPolicyStructure` (auto-selects the topology
    // node) AND keep server/client rendering symmetric on hard navigations.
    const searchParams = useSearchParams();
    const selectedNodeAddress = searchParams?.get('node') ?? undefined;

    // Orchestrators (multi-dispatch dispatchers) live alongside leaf policies in
    // `data.orchestratorPolicies` rather than `data.policies` so KPI counters
    // and the "Policies" overview pill don't double-count them with the
    // dedicated `FlowMultiDispatchCard`.  The detail route falls back to that
    // mirror list so a click on the orchestrator card resolves cleanly.
    // Resolved BEFORE the early returns so the `useIsLmmDispatcherPolicy`
    // hook below sees a stable `policy?.address` on every render.
    const matchById = (p: IFlowPolicy) =>
        p.id === decodedPolicyId || p.id === policyId;
    const policy = data
        ? (data.policies.find(matchById) ??
          data.orchestratorPolicies.find(matchById))
        : undefined;
    const isLmmDispatcher = useIsLmmDispatcherPolicy(policy?.address);

    if (data == null) {
        if (isError) {
            return <FlowLoadError />;
        }
        return <FlowPolicyDetailPageSkeleton />;
    }

    if (policy == null) {
        return (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-0 p-6">
                <h1 className="font-semibold text-neutral-800 text-xl leading-tight">
                    Policy not found
                </h1>
                <p className="font-normal text-neutral-500 text-sm leading-relaxed">
                    No policy with id <code>{decodedPolicyId}</code> is
                    installed on this DAO.
                </p>
                <Link
                    className="font-normal text-primary-400 text-sm leading-tight hover:text-primary-600"
                    href={base}
                >
                    ← Back to overview
                </Link>
            </div>
        );
    }

    const handleDispatchClick = () => {
        // LMM_DEMO_HACK: the dispatcher policy doesn't have a meaningful
        // single-token "pending amount" or recipient list — the dispatch
        // fans out into 3 strategy legs against different tokens.  The
        // generic `ConfirmDispatchDialog` was misrepresenting it as "0
        // USDC · No recipients yet"; for the demo we skip straight to the
        // LMM-specific `LmmDemoDispatchDialog` (rendered from
        // `dispatchPolicy` → `DispatchTransactionDialog`), which already
        // shows the simulator's per-leg breakdown.
        if (isLmmDispatcher) {
            dispatchPolicy(policy.id);
            return;
        }
        const params: IConfirmDispatchDialogParams = {
            policy,
            onConfirm: () => dispatchPolicy(policy.id),
        };
        open(FlowDialogId.CONFIRM_DISPATCH, { params });
    };

    const dispatchable =
        isDispatchableStrategy(policy.strategy) && policy.status !== 'paused';
    const pendingDispatch = getPendingDispatch(policy.id);
    const isDispatching = pendingDispatch != null;
    // Mirrors FlowPolicyCard: we allow manual dispatch for every non-claimer,
    // non-archived router regardless of whether it's already "live" — the only
    // hard gates are a live cooldown and an in-flight tx we haven't confirmed.
    // LMM_DEMO_HACK: `chainNowMs` overrides Date.now() when the anvil fork
    // has been warped via the cheats menu, so warping past the cooldown
    // actually unlocks the Dispatch button — see useLmmChainNow.
    const nowMs = chainNowMs ?? Date.now();
    const cooldownActive =
        policy.status === 'cooldown' &&
        policy.cooldown != null &&
        new Date(policy.cooldown.readyAt).getTime() > nowMs;
    const dispatchDisabled = cooldownActive || isDispatching;
    const dispatchLabel = isDispatching
        ? 'Dispatching…'
        : policy.pending != null
          ? `Dispatch now · ${formatFlowAmount(policy.pending.amount, policy.pending.token)} ${policy.pending.token}`
          : 'Dispatch now';

    return (
        <div className="flex flex-col gap-6">
            <LmmDemoBanner />
            <header className="flex flex-col gap-4">
                {/* Stack vertically below `md` so mobile gets the title block
                 *  first then the CTA underneath.  On `md+` switch to a row
                 *  with `flex-1` left (claims all remaining space and clamps
                 *  long descriptions with `min-w-0`) and a 260px right rail
                 *  (`shrink-0` so it never collapses or wraps below). */}
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="font-semibold text-2xl text-neutral-800 leading-tight md:text-3xl">
                                {policy.name}
                            </h1>
                            <FlowStrategyChip strategy={policy.strategy} />
                            {/* LMM_DEMO_HACK: the dispatcher policy has no
                             * single "token" — its three legs touch stETH,
                             * wstETH, LDO and (mock) USDC.  `policy.token`
                             * fallbacks to `'USDC'` for never-dispatched
                             * multi-dispatch policies (see envioFlowMapper.ts
                             * → `policyToken`), which is misleading.  Skip
                             * the chip for the LMM dispatcher and let the
                             * strategy chip carry the headline instead. */}
                            {!isLmmDispatcher && (
                                <FlowTokenChip token={policy.token} />
                            )}
                        </div>
                        <p className="font-normal text-base text-neutral-500 leading-relaxed">
                            {policy.description}
                        </p>
                        {/* Keep the metadata row focused: current status, when
                         * the policy was installed (and via which proposal),
                         * and the edit link. Full lifecycle lives in the
                         * `FlowPolicyHistory` section below, so no compact
                         * ribbon here. */}
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge policy={policy} />
                            <InstalledViaPill
                                addressOrEns={addressOrEns}
                                network={network}
                                policy={policy}
                            />
                            <Link
                                aria-label={`Edit ${policy.name} in DAO settings`}
                                className="inline-flex items-center gap-1 font-normal text-neutral-500 text-xs leading-tight hover:text-primary-500"
                                href={`/dao/${network}/${addressOrEns}/settings/automations/${policy.address}`}
                                rel="noopener"
                                target="_blank"
                            >
                                Edit ↗
                            </Link>
                        </div>
                    </div>
                    {/* Right rail: primary CTA + supporting copy + (demo only)
                     *  cheats menu.  `md:shrink-0` keeps the rail at exactly
                     *  260px on desktop (never wraps below the title block);
                     *  on mobile it spans full width under the header. */}
                    <div className="flex w-full flex-col items-stretch gap-2 md:w-[260px] md:shrink-0">
                        {policy.status === 'paused' ? (
                            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-warning-100 px-3 py-1.5 font-semibold text-sm text-warning-800 leading-tight">
                                {policy.uninstalledAt
                                    ? `Archived · uninstalled ${formatRelative(policy.uninstalledAt)}`
                                    : 'Archived · uninstalled'}
                            </span>
                        ) : dispatchable ? (
                            <>
                                <Button
                                    className="w-full"
                                    disabled={dispatchDisabled}
                                    onClick={handleDispatchClick}
                                    size="md"
                                    variant={
                                        dispatchDisabled
                                            ? 'tertiary'
                                            : 'primary'
                                    }
                                >
                                    {dispatchLabel}
                                </Button>
                                <span className="text-right font-normal text-neutral-500 text-xs leading-snug">
                                    {dispatchDisabled
                                        ? dispatchDisabledReason(policy, nowMs)
                                        : 'Dispatches the pending amount to all recipients.'}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 font-semibold text-neutral-700 text-sm leading-tight">
                                    {policy.pending != null
                                        ? `${formatFlowAmount(policy.pending.amount, policy.pending.token)} ${policy.pending.token} claimable`
                                        : 'Claim window open'}
                                </span>
                                <span className="text-right font-normal text-neutral-500 text-xs leading-snug">
                                    Pull-based policy — recipients claim
                                    directly, no manual dispatch required.
                                </span>
                            </>
                        )}
                        {/* LMM_DEMO_HACK: the cheats menu used to live in
                         * the metadata-pill row (status / installed / edit).
                         * It crowded that row to three wrapping lines in the
                         * LMM demo — moved here so it sits as a secondary
                         * action below the primary Dispatch CTA. */}
                        {LMM_DEMO_MODE && (
                            <div className="flex justify-end pt-1">
                                <LmmCheatsMenu />
                            </div>
                        )}
                    </div>
                </div>
                {pendingDispatch != null && (
                    <FlowWaitingForIndexerBadge
                        network={network}
                        pending={pendingDispatch}
                        variant="block"
                    />
                )}
            </header>

            <FlowPolicyChart
                addressOrEns={addressOrEns}
                network={network}
                policy={policy}
            />
            <FlowPolicyStructure
                policy={policy}
                selectedNodeAddress={selectedNodeAddress}
            />
            <FlowRecipientsTable data={data} policy={policy} variant="policy" />
            <FlowPolicyHistory policy={policy} />
        </div>
    );
};

const dispatchDisabledReason = (policy: IFlowPolicy, nowMs: number): string => {
    if (policy.status === 'cooldown') {
        return `Cooldown · ready ${policy.cooldown != null ? formatRelative(policy.cooldown.readyAt, nowMs) : ''}.`;
    }
    if (policy.status === 'paused') {
        return 'Paused for review. Resume via a governance proposal.';
    }
    if (policy.status === 'awaiting') {
        return 'Awaiting activation proposal.';
    }
    return policy.nextDispatchLabel;
};

const StatusBadge: React.FC<{ policy: IFlowPolicy }> = ({ policy }) => {
    const toneByStatus: Record<string, string> = {
        ready: 'bg-primary-100 text-primary-800',
        // Neutralised — was success-100/text-success-800.
        live: 'bg-neutral-100 text-neutral-700',
        cooldown: 'bg-neutral-100 text-neutral-700',
        awaiting: 'bg-neutral-100 text-neutral-700',
        paused: 'bg-warning-100 text-warning-800',
        never: 'bg-neutral-100 text-neutral-500',
    };
    return (
        <span
            className={classNames(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-semibold text-xs leading-tight',
                toneByStatus[policy.status],
            )}
        >
            <FlowStatusDot status={policy.status} />
            {policy.statusLabel}
        </span>
    );
};

/**
 * "Installed {date} via {proposal}" chip. Uses the proposal title when the
 * REST join resolved it, otherwise falls back to the shorter slug / id (or a
 * plain "Installed {date}" when we have no attribution at all). Linkified
 * whenever we know the proposal slug so the user can jump to it.
 */
const InstalledViaPill: React.FC<{
    policy: IFlowPolicy;
    network: string;
    addressOrEns: string;
}> = ({ policy, network, addressOrEns }) => {
    const proposalLabel =
        policy.installedViaProposalTitle ??
        (policy.installedViaProposal !== '—'
            ? policy.installedViaProposal
            : undefined);
    const proposalHref = policy.installedViaProposalSlug
        ? `/dao/${network}/${addressOrEns}/proposals/${policy.installedViaProposalSlug}`
        : null;

    if (proposalHref) {
        return (
            <Link
                className="inline-flex items-center rounded-full bg-primary-50 px-2 py-0.5 font-normal text-primary-700 text-xs leading-tight hover:bg-primary-100"
                href={proposalHref}
                title={
                    proposalLabel
                        ? `Installed ${formatShortDate(policy.createdAt)} via ${proposalLabel}`
                        : undefined
                }
            >
                Installed {formatShortDate(policy.createdAt)}
                {proposalLabel ? <> · {proposalLabel} →</> : <> →</>}
            </Link>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 font-normal text-neutral-700 text-xs leading-tight">
            Installed {formatShortDate(policy.createdAt)}
            {proposalLabel ? ` · ${proposalLabel}` : ''}
        </span>
    );
};

'use client';

import { EmptyState } from '@aragon/gov-ui-kit';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
    buildFlowGraph,
    MEANINGFUL_AMOUNT_EPS,
} from '../../canvas/buildFlowGraph';
import { toFlowMachineDescriptor } from '../../canvas/flowDescriptor';
import { toLiveDynamics } from '../../canvas/flowDynamics';
import { toIndexedDynamics } from '../../canvas/toIndexedDynamics';
import { FlowLoadError } from '../../components/flowSkeletons';
import {
    buildFlowDescription,
    buildFlowOptions,
    buildHistory,
    buildNextRun,
    buildRecipientHint,
    buildStats,
    toRunDynamics,
} from '../../components/flowWorkbench/buildWorkbenchModel';
import { FlowFocus } from '../../components/flowWorkbench/flowFocus';
import type { IWorkbenchModel } from '../../components/flowWorkbench/workbenchModel';
import { useLmmManifest } from '../../demo/useLmmManifest';
import { useFlowDataContext } from '../../providers/flowDataProvider';
import { buildFlowAddressBook } from '../../utils/flowAddressBook';

export interface IFlowWorkbenchPageClientProps {
    network: string;
    addressOrEns: string;
}

export const FlowWorkbenchPageClient: React.FC<
    IFlowWorkbenchPageClientProps
> = () => {
    const { data, isError, liveSnapshot, now, dispatchPolicy } =
        useFlowDataContext();
    const { manifest } = useLmmManifest();
    // Operational DAO vault (holds budgets, runs strategies). Outputs landing at
    // any other address (e.g. the UniV2 LP → Lido Agent) are shown as external
    // recipients rather than looped back to the vault.
    const daoAddress = manifest?.lmm?.dao;

    const router = useRouter();
    const pathname = usePathname() ?? '';
    const searchParams = useSearchParams();

    const flowParam = searchParams?.get('flow') ?? null;
    const runParam = searchParams?.get('run') ?? null;

    const setParams = useCallback(
        (next: { flow?: string | null; run?: string | null }) => {
            const params = new URLSearchParams(searchParams?.toString() ?? '');
            for (const [key, value] of Object.entries(next)) {
                if (value == null) {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            }
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname, {
                scroll: false,
            });
        },
        [router, pathname, searchParams],
    );

    const orchestrators = data?.orchestrators ?? [];
    const selectedFlowId = flowParam ?? orchestrators[0]?.id ?? null;
    const orchestrator = useMemo(
        () => orchestrators.find((o) => o.id === selectedFlowId) ?? null,
        [orchestrators, selectedFlowId],
    );

    const recipient = useMemo(() => {
        if (!(data && orchestrator)) {
            return undefined;
        }
        // The external recipient is whatever address a leg's output lands at that
        // isn't the operational vault (here: the UniV2 LP → Lido Agent). Derived
        // from the indexed edges (data), labelled via the shared address book —
        // no per-flow hardcode; proceeds that loop back to the vault aren't this.
        const book = buildFlowAddressBook(
            daoAddress
                ? { dao: { address: daoAddress, name: data.dao.name } }
                : {},
        );
        const dao = daoAddress?.toLowerCase();
        for (const step of orchestrator.latestIndexedSteps ?? []) {
            for (const edge of step.edges) {
                const external =
                    (edge.role === 'vaultIn' || edge.role === 'external') &&
                    edge.to != null &&
                    (dao == null || edge.to.toLowerCase() !== dao);
                if (external && edge.to) {
                    return {
                        address: edge.to,
                        label:
                            book.resolve(edge.to)?.label ??
                            `${edge.to.slice(0, 6)}…${edge.to.slice(-4)}`,
                    };
                }
            }
        }
        return buildRecipientHint(data);
    }, [data, orchestrator, daoAddress]);

    const descriptor = useMemo(() => {
        if (!(data && orchestrator)) {
            return null;
        }
        return toFlowMachineDescriptor(orchestrator, {
            sourceLabel: `${data.dao.name} Vault`,
            recipient: recipient
                ? { address: recipient.address ?? '', label: recipient.label }
                : undefined,
        });
    }, [data, orchestrator, recipient]);

    // Live RPC overlay applies generically by address — only when the live
    // snapshot's dispatcher is the selected orchestrator. Powers the forward
    // "next dispatch" summary + the budget/gate/epoch sub-node readings.
    const liveDynamics = useMemo(() => {
        const snapshot = liveSnapshot?.snapshot;
        if (!(descriptor && snapshot && orchestrator)) {
            return null;
        }
        const matches =
            liveSnapshot?.dispatcherAddress?.toLowerCase() ===
            orchestrator.address.toLowerCase();
        return matches ? toLiveDynamics({ descriptor, snapshot }) : null;
    }, [descriptor, liveSnapshot, orchestrator]);

    // Default canvas dynamics = the UPCOMING dispatch. We show what the next
    // dispatch will move (live RPC simulation: amounts + budget/gate/epoch
    // readings + balances + would-fire state), NOT the last settled run — the
    // previous-run amounts read as misleading next to a live "Firing"/budget.
    // History/replay (the `?run=` path below) is where past runs are shown.
    // Falls back to the latest indexed run only when there is no live snapshot.
    const overviewDynamics = useMemo(() => {
        if (liveDynamics) {
            return liveDynamics;
        }
        const indexedSteps = orchestrator?.latestIndexedSteps ?? [];
        if (indexedSteps.length === 0) {
            return null;
        }
        return toIndexedDynamics({
            steps: indexedSteps,
            runId: null,
            daoAddress,
        });
    }, [orchestrator, liveDynamics, daoAddress]);

    const activeRun = useMemo(() => {
        if (!(orchestrator && runParam)) {
            return null;
        }
        return orchestrator.runs.some((r) => r.id === runParam)
            ? runParam
            : null;
    }, [orchestrator, runParam]);

    const graph = useMemo(() => {
        if (!descriptor) {
            return null;
        }
        if (activeRun != null) {
            const run =
                orchestrator?.runs.find((r) => r.id === activeRun) ??
                orchestrator?.runs[0];
            // Prefer the indexer's provenance steps for the run; fall back to
            // the legacy leg projection for runs without indexed data.
            const replay = run?.indexedSteps?.length
                ? toIndexedDynamics({
                      steps: run.indexedSteps,
                      runId: run.id,
                      daoAddress,
                  })
                : run
                  ? toRunDynamics(descriptor, run)
                  : null;
            return buildFlowGraph({ descriptor, dynamics: replay });
        }
        return buildFlowGraph({ descriptor, dynamics: overviewDynamics });
    }, [descriptor, activeRun, overviewDynamics, orchestrator, daoAddress]);

    const model = useMemo<IWorkbenchModel | null>(() => {
        if (!data) {
            return null;
        }
        return {
            dao: data.dao.name,
            flows: buildFlowOptions(data),
            selectedFlowId,
            stats: orchestrator ? buildStats(orchestrator, now) : null,
            nextRun:
                descriptor && liveDynamics
                    ? buildNextRun(descriptor, liveDynamics)
                    : null,
            history: orchestrator ? buildHistory(orchestrator, now) : [],
            isLive: liveDynamics != null,
        };
    }, [data, selectedFlowId, orchestrator, descriptor, liveDynamics, now]);

    const description = useMemo(
        () => (orchestrator ? buildFlowDescription(orchestrator) : undefined),
        [orchestrator],
    );

    // Honest dispatch affordance: enable only when the live simulation says at
    // least one leg would actually MOVE a meaningful amount. The simulator
    // already encodes every strategy gate (paused, gate closed, oracle stale,
    // same-epoch slot burned, zero budget) → a gated leg isn't `willFire`; on
    // top of that we drop dust (wrapping 1 wei of leftover stETH "fires" but
    // moves nothing). With no live snapshot we can't predict, so leave enabled.
    const moves = (a: number | null): boolean =>
        a == null || Math.abs(a) > MEANINGFUL_AMOUNT_EPS;
    const dispatchMoves = (s: {
        willFire: boolean;
        ins: { amount: number | null }[];
        outs: { amount: number | null }[];
    }) =>
        s.willFire &&
        (s.ins.some((i) => moves(i.amount)) ||
            s.outs.some((o) => moves(o.amount)));
    const canDispatch =
        orchestrator != null &&
        (model?.nextRun == null || model.nextRun.steps.some(dispatchMoves));
    const dispatchReason = canDispatch
        ? undefined
        : 'Nothing to dispatch right now — balances are empty, the epoch slot is already used, or a gate is closed. Top up, warp an epoch, or open the gate.';

    const onDispatch = useCallback(() => {
        if (orchestrator) {
            dispatchPolicy(orchestrator.id);
        }
    }, [orchestrator, dispatchPolicy]);

    if (data == null) {
        if (isError) {
            return <FlowLoadError />;
        }
        return <WorkbenchLoading />;
    }

    if (orchestrators.length === 0 || model == null) {
        return (
            <div className="flex h-full items-center justify-center p-10">
                <EmptyState
                    description="Multi-dispatch flows you install will appear here as a live capital-flow canvas."
                    heading="No flows yet"
                    objectIllustration={{ object: 'SETTINGS' }}
                />
            </div>
        );
    }

    return (
        <FlowFocus
            activeRun={activeRun}
            canDispatch={canDispatch}
            description={description}
            dispatchReason={dispatchReason}
            graph={graph}
            model={model}
            onClearReplay={() => setParams({ run: null })}
            onDispatch={onDispatch}
            onReplay={(run) => setParams({ run })}
            onSelectFlow={(id) => setParams({ flow: id, run: null })}
            recipient={recipient}
        />
    );
};

const WorkbenchLoading: React.FC = () => (
    <div className="flex h-full items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-neutral-200 border-t-primary-500" />
    </div>
);

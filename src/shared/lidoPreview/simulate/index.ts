// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// Public simulate() entry. Orchestrates predictors, owns the mutable
// ChainState, builds the FlowGraph.
//
// Side-effect: importing this module registers the built-in predictors
// (via `./predictors.ts`).

import './predictors';

import type { Address, PublicClient } from 'viem';
import { findPredictor } from '../registry/index';
import type { PredictResult, SimulationContext } from '../registry/types';
import type {
    FlowGraph,
    FlowWarning,
    Step,
    VaultSnapshot,
} from '../types/flow';
import type { TokenInfo } from '../types/primitives';
import type { StrategyNode, TopologyGraph } from '../types/topology';
import {
    addBalance,
    type ChainState,
    collectReadsFromTopology,
    fetchChainState,
    getBalance,
    getEpoch,
} from './chainState';

export type SimulateOptions = {
    /** Pre-fetched chain state. If omitted, `simulate()` reads from `client`. */
    chainState?: ChainState;
    /** Block number to read at when fetching chain state. */
    blockNumber?: bigint;
};

/**
 * Walk `topology` step-by-step and return the predicted money flow. Each
 * step's `before` and `after` snapshots are self-contained so a UI can
 * scrub through them without re-running the simulator.
 */
export async function simulate(
    client: PublicClient,
    topology: TopologyGraph,
    options: SimulateOptions = {},
): Promise<FlowGraph> {
    if (topology.root.kind !== 'plugin.dispatch') {
        // Phase 1 supports Dispatcher plugins only. The other plugin kinds are
        // modelled for future phases but not yet simulated.
        throw new Error(
            `simulate(): plugin kind "${topology.root.kind}" is not supported yet`,
        );
    }

    const plugin = topology.root;
    const vault = plugin.dao;

    const [chainId, blockNumber] = await Promise.all([
        client.getChainId(),
        options.blockNumber !== undefined
            ? Promise.resolve(options.blockNumber)
            : client.getBlockNumber(),
    ]);

    const state: ChainState =
        options.chainState !== undefined
            ? cloneState(options.chainState)
            : await fetchChainState(client, topology, { blockNumber });

    const warnings: FlowWarning[] = [];

    const { tokens, epochProviders } = collectReadsFromTopology(topology);
    const failsafeMap = plugin.failsafeStrategyMap;

    const initialState = snapshotFromState(
        vault,
        state,
        tokens,
        epochProviders,
    );

    const steps: Step[] = [];
    let opaqueEncountered = false;

    for (let i = 0; i < plugin.strategies.length; i++) {
        const strategy = plugin.strategies[i]!;
        const failsafe = (failsafeMap & (1n << BigInt(i))) !== 0n;

        const before = snapshotFromState(vault, state, tokens, epochProviders);

        const step = await predictStep({
            strategy,
            state,
            ctx: buildCtx({
                client,
                chainId,
                blockNumber,
                vault,
                stepIndex: i,
                warnings,
            }),
            before,
            stepIndex: i,
            opaqueEncountered,
            failsafe,
        });

        applyStepToState(state, step, vault);

        const after = snapshotFromState(vault, state, tokens, epochProviders);
        const resolvedStep: Step = { ...step, after };

        if (
            resolvedStep.status === 'opaque' ||
            strategy.kind === 'strategy.unknown'
        ) {
            opaqueEncountered = true;
        }

        steps.push(resolvedStep);
    }

    const finalState = snapshotFromState(vault, state, tokens, epochProviders);

    return {
        version: 1,
        chainId,
        simulatedAtBlock: blockNumber,
        simulatedAt: new Date().toISOString(),
        plugin: plugin.address,
        initialState,
        steps,
        finalState,
        warnings,
    };
}

// --- Internals -------------------------------------------------------------

type PredictInputs = {
    strategy: StrategyNode;
    state: ChainState;
    ctx: SimulationContext;
    before: VaultSnapshot;
    stepIndex: number;
    opaqueEncountered: boolean;
    failsafe: boolean;
};

async function predictStep({
    strategy,
    state,
    ctx,
    before,
    stepIndex,
    opaqueEncountered,
    failsafe,
}: PredictInputs): Promise<Step> {
    // Unknown strategies are opaque by definition.
    if (strategy.kind === 'strategy.unknown') {
        return {
            index: stepIndex,
            strategyIndex: stepIndex,
            strategyRef: { address: strategy.address, kind: strategy.kind },
            status: 'opaque',
            reason: `unknown strategyId "${strategy.strategyId}"`,
            transfers: [],
            externalCalls: [],
            before,
            after: before,
            notes: failsafe
                ? ['marked failsafe — failure would not revert dispatch']
                : [],
        };
    }

    // Any deterministic strategy that runs after an opaque one inherits the
    // uncertainty for token balances it reads.
    if (opaqueEncountered) {
        return {
            index: stepIndex,
            strategyIndex: stepIndex,
            strategyRef: { address: strategy.address, kind: strategy.kind },
            status: 'downstream-opaque',
            reason: "a prior step was opaque — this step's inputs are uncertain",
            transfers: [],
            externalCalls: [],
            before,
            after: before,
            notes: failsafe
                ? ['marked failsafe — failure would not revert dispatch']
                : [],
        };
    }

    const predictor = findPredictor(strategy.kind);
    if (!predictor) {
        ctx.warn(
            'predictor.unregistered',
            `No predictor registered for kind "${strategy.kind}"`,
            stepIndex,
        );
        return {
            index: stepIndex,
            strategyIndex: stepIndex,
            strategyRef: { address: strategy.address, kind: strategy.kind },
            status: 'opaque',
            reason: `no predictor registered for kind "${strategy.kind}"`,
            transfers: [],
            externalCalls: [],
            before,
            after: before,
            notes: [],
        };
    }

    const result: PredictResult = await predictor.predict(strategy, state, ctx);

    return {
        index: stepIndex,
        strategyIndex: stepIndex,
        strategyRef: { address: strategy.address, kind: strategy.kind },
        status: result.status,
        ...(result.reason === undefined ? {} : { reason: result.reason }),
        ...(result.budget === undefined ? {} : { budget: result.budget }),
        transfers: result.transfers,
        externalCalls: result.externalCalls,
        before,
        after: before, // filled in by the caller after applying the step
        notes: failsafe
            ? [
                  ...result.notes,
                  'marked failsafe — failure would not revert dispatch',
              ]
            : result.notes,
    };
}

/** Mutate `state` to reflect everything a predicted step does to the vault. */
function applyStepToState(state: ChainState, step: Step, vault: Address): void {
    for (const t of step.transfers) {
        addBalance(state, vault, t.token.address, -t.amount);
        // We don't track recipient balances — they're not part of the vault.
    }
    for (const call of step.externalCalls) {
        for (const c of call.consumes) {
            addBalance(state, vault, c.token.address, -c.amount);
        }
        for (const p of call.produces) {
            addBalance(state, vault, p.token.address, p.amount);
        }
    }
}

function snapshotFromState(
    dao: Address,
    state: ChainState,
    tokens: TokenInfo[],
    epochProviders: Address[],
): VaultSnapshot {
    const balances = tokens.map((token) => ({
        token,
        amount: getBalance(state, dao, token.address),
        provenance: 'deterministic' as const,
    }));
    const epoch = epochProviders
        .map((provider) => getEpoch(state, provider))
        .find((v) => v !== undefined);
    return {
        dao,
        balances,
        ...(epoch === undefined ? {} : { epoch }),
    };
}

function cloneState(state: ChainState): ChainState {
    return {
        balances: new Map(state.balances),
        epochs: new Map(state.epochs),
    };
}

function buildCtx(base: {
    client: PublicClient;
    chainId: number;
    blockNumber: bigint;
    vault: Address;
    stepIndex: number;
    warnings: FlowWarning[];
}): SimulationContext {
    return {
        client: base.client,
        chainId: base.chainId,
        blockNumber: base.blockNumber,
        vault: base.vault,
        stepIndex: base.stepIndex,
        warn: (code, message, stepIndex) => {
            base.warnings.push(
                stepIndex === undefined
                    ? { code, message }
                    : { code, message, stepIndex },
            );
        },
    };
}

export type { ChainState } from './chainState';
export { fetchChainState } from './chainState';

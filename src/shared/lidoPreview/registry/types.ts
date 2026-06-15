// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address, PublicClient } from 'viem';
import type { ChainState } from '../simulate/chainState';
import type { ExternalCall, StepStatus, Transfer } from '../types/flow';
import type { Provenance, TokenInfo } from '../types/primitives';
import type {
    BudgetNode,
    PluginNode,
    SplitterNode,
    StrategyNode,
} from '../types/topology';

/**
 * Shared context threaded through introspection. Inspectors use it to read
 * from chain and to record non-fatal issues (the returned graph still holds
 * a partial node; warnings surface alongside).
 */
export type IntrospectionContext = {
    client: PublicClient;
    chainId: number;
    blockNumber: bigint;
    warn: (code: string, message: string, path?: string) => void;
};

/**
 * Shared context threaded through simulation. Predictors use it to record
 * issues attached to the step they're producing and to access the surrounding
 * topology (the DAO vault address, the current step index).
 */
export type SimulationContext = {
    client: PublicClient;
    chainId: number;
    blockNumber: bigint;
    /** The DAO address — the vault that holds the tokens being dispatched. */
    vault: Address;
    /** Index of the strategy currently being predicted. */
    stepIndex: number;
    warn: (code: string, message: string, stepIndex?: number) => void;
};

// --- Inspectors -------------------------------------------------------------

export type PluginInspector = {
    id: string;
    kind: PluginNode['kind'];
    inspect: (
        address: Address,
        ctx: IntrospectionContext,
    ) => Promise<PluginNode>;
};

export type StrategyInspector = {
    id: string;
    kind: StrategyNode['kind'];
    inspect: (
        address: Address,
        ctx: IntrospectionContext,
    ) => Promise<StrategyNode>;
};

export type BudgetInspector = {
    id: string;
    kind: BudgetNode['kind'];
    inspect: (
        address: Address,
        ctx: IntrospectionContext,
    ) => Promise<BudgetNode>;
};

export type SplitterInspector = {
    id: string;
    kind: SplitterNode['kind'];
    inspect: (
        address: Address,
        ctx: IntrospectionContext,
    ) => Promise<SplitterNode>;
};

// --- Predictors -------------------------------------------------------------

/**
 * What a predictor tells the simulator. The simulator owns the ChainState
 * and converts the result into a Step (filling in `before` / `after` from
 * its own book-keeping).
 */
export type PredictResult = {
    status: StepStatus;
    reason?: string;
    budget?: { amount: bigint; token: TokenInfo; provenance: Provenance };
    transfers: Transfer[];
    externalCalls: ExternalCall[];
    notes: string[];
};

export type StrategyPredictor = {
    kind: StrategyNode['kind'];
    predict: (
        node: StrategyNode,
        state: ChainState,
        ctx: SimulationContext,
    ) => Promise<PredictResult>;
};

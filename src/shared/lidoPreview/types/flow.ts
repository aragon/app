// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import type { Provenance, TokenInfo } from './primitives';
import type { NodeKind } from './topology';

/**
 * Stepped simulation of a dispatch call against a TopologyGraph at a given
 * block. Each Step is self-contained (carries before/after snapshots) so a
 * UI can scrub through them without re-running the simulator.
 */
export type FlowGraph = {
    version: 1;
    chainId: number;
    simulatedAtBlock: bigint;
    simulatedAt: string; // ISO 8601
    plugin: Address;
    initialState: VaultSnapshot;
    steps: Step[];
    finalState: VaultSnapshot;
    warnings: FlowWarning[];
};

export type FlowWarning = {
    code: string;
    message: string;
    stepIndex?: number;
};

export type VaultSnapshot = {
    dao: Address;
    balances: TokenBalance[];
    /** Present when any strategy consults an epoch provider. */
    epoch?: bigint;
};

export type TokenBalance = {
    token: TokenInfo;
    amount: bigint;
    provenance: Provenance;
};

export type Step = {
    index: number;
    strategyIndex: number;
    strategyRef: { address: Address; kind: NodeKind };
    status: StepStatus;
    /** Human-readable note explaining non-`executed` statuses. */
    reason?: string;
    budget?: {
        amount: bigint;
        token: TokenInfo;
        provenance: Provenance;
    };
    transfers: Transfer[];
    externalCalls: ExternalCall[];
    before: VaultSnapshot;
    after: VaultSnapshot;
    notes: string[];
};

export type StepStatus =
    | 'executed' // Transfer happened or burn occurred as modelled.
    | 'no-op' // Strategy ran but produced no actions (e.g. already dispatched this epoch).
    | 'skipped-paused' // Strategy.paused() === true.
    | 'opaque' // Unknown strategy — could not predict output.
    | 'downstream-opaque'; // Known strategy executed after an opaque one.

export type Transfer = {
    from: Address;
    to: Address;
    token: TokenInfo;
    amount: bigint;
    provenance: Provenance;
};

export type ExternalCall = {
    to: Address;
    description: string;
    value?: bigint;
    /**
     * Token deltas this call causes on the vault. Used by the simulator to
     * propagate effects into the next step's VaultSnapshot.
     */
    produces: TokenDelta[];
    consumes: TokenDelta[];
};

export type TokenDelta = {
    token: TokenInfo;
    amount: bigint;
    provenance: Provenance;
};

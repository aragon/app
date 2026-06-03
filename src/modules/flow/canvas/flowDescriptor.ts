/**
 * Build a generic {@link IFlowMachineDescriptor} (static structure) from the
 * indexer-derived domain types. This is the generalization seam: the canvas
 * never reads `IFlowOrchestrator` directly, only the normalized descriptor, so
 * any flow shape maps through the same path.
 *
 * NO HARDCODE: every field comes from the generic taxonomy on
 * `IFlowEmbeddedStrategy` (`kind`, `index`, `budget.kind`, `gate.kind`,
 * `epochProvider`) — never from a token symbol or DAO address. Labels resolve
 * through {@link primitiveRegistry}.
 */

import type { IFlowEmbeddedStrategy, IFlowOrchestrator } from '../types';
import type {
    IFlowMachineDescriptor,
    IFlowStepDescriptor,
    IFlowSubInputDescriptor,
} from './flowGraphTypes';
import {
    getBudgetDisplay,
    getEpochDisplay,
    getGateDisplay,
    getStrategyDisplay,
} from './primitiveRegistry';

export interface IToDescriptorOptions {
    /** Label for the funding vault (e.g. the DAO name). */
    sourceLabel: string;
    sourceAddress?: string;
    /** Terminal recipient hint, resolved from real recipient data by the caller. */
    recipient?: { address: string; label: string };
}

/** Humanize an epoch-denominated reserve into a duration when the epoch length
 *  is known (e.g. 168 epochs × 1h = "7d"); falls back to an epoch count. */
const formatFloor = (
    floorEpochs?: string,
    epochLengthSeconds?: number,
): string | undefined => {
    if (floorEpochs == null) {
        return undefined;
    }
    const floor = Number(floorEpochs);
    if (!Number.isFinite(floor) || floor <= 0) {
        return undefined;
    }
    if (epochLengthSeconds && epochLengthSeconds > 0) {
        const seconds = floor * epochLengthSeconds;
        const days = Math.round(seconds / 86_400);
        if (days >= 1) {
            return `${days}d floor`;
        }
        const hours = Math.round(seconds / 3600);
        if (hours >= 1) {
            return `${hours}h floor`;
        }
    }
    return `${floor.toLocaleString('en-US')}-epoch floor`;
};

const buildStepInputs = (
    strategy: IFlowEmbeddedStrategy,
): IFlowSubInputDescriptor[] => {
    const inputs: IFlowSubInputDescriptor[] = [];
    const epochLengthSeconds = strategy.epochProvider?.epochLength
        ? Number(strategy.epochProvider.epochLength)
        : undefined;

    if (strategy.budget) {
        const display = getBudgetDisplay(strategy.budget.kind);
        const noteParts = [
            formatFloor(strategy.budget.floorEpochs, epochLengthSeconds),
            strategy.budget.targetEpoch
                ? `target epoch ${Number(strategy.budget.targetEpoch).toLocaleString('en-US')}`
                : undefined,
        ].filter((part): part is string => part != null);
        inputs.push({
            role: 'budget',
            kind: strategy.budget.kind,
            label: display.label,
            note: noteParts.length > 0 ? noteParts.join(' · ') : undefined,
        });
    }

    if (strategy.gate) {
        const display = getGateDisplay(strategy.gate.kind);
        inputs.push({
            role: 'gate',
            kind: strategy.gate.kind,
            label: display.label,
        });
    }

    if (strategy.epochProvider) {
        const display = getEpochDisplay();
        const seconds = epochLengthSeconds;
        const note =
            seconds && seconds > 0
                ? `epoch length ${seconds >= 3600 ? `${Math.round(seconds / 3600)}h` : `${seconds}s`}`
                : undefined;
        inputs.push({
            role: 'epoch',
            kind: 'epoch',
            label: display.label,
            note,
        });
    }

    return inputs;
};

const toStep = (strategy: IFlowEmbeddedStrategy): IFlowStepDescriptor => {
    const display = getStrategyDisplay(strategy.kind);
    return {
        index: strategy.index,
        address: strategy.address,
        kind: strategy.kind,
        // Prefer the embedded strategy's own label when present, else registry.
        label: strategy.label || display.label,
        subtitle: display.subtitle,
        paused: strategy.paused,
        inputs: buildStepInputs(strategy),
    };
};

/**
 * Normalize a multi-dispatch orchestrator's embedded strategies into a
 * descriptor. Returns `null` when the orchestrator has no embedded strategies
 * (e.g. a legacy multi-router that fans out to separate plugin policies — a
 * later increment will derive a descriptor from its `chain`).
 */
export const toFlowMachineDescriptor = (
    orchestrator: IFlowOrchestrator,
    options: IToDescriptorOptions,
): IFlowMachineDescriptor | null => {
    const embedded = orchestrator.embeddedStrategies;
    if (embedded == null || embedded.length === 0) {
        return null;
    }
    const steps = [...embedded].sort((a, b) => a.index - b.index).map(toStep);

    return {
        id: orchestrator.id,
        source: { address: options.sourceAddress, label: options.sourceLabel },
        steps,
        recipient: options.recipient,
    };
};

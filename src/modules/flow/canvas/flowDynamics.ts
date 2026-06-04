/**
 * Live dynamics producer — projects an LMM `StatusSnapshot` (RPC reads +
 * `simulate()` of the next dispatch) onto the generic {@link IFlowDynamics}
 * overlay that {@link buildFlowGraph} consumes.
 *
 * This is a generalized overlay-by-address, NOT an LMM-specific descriptor:
 * per-step state, budget/gate/epoch readings, and the per-step token in/out
 * flows are all read from the snapshot and matched to the descriptor by
 * strategy address. The edge topology itself is still INFERRED by
 * `buildFlowGraph` from those token flows — nothing here declares edges or
 * hard-codes token symbols. When the indexer surfaces an `OrchestratorSnapshot`
 * the same shape is produced from indexed data instead of RPC.
 */

import type { Address } from 'viem';
import type {
    FlowGraph,
    Provenance,
    Step,
    TokenInfo,
} from '@/shared/lidoPreview';
import type { StatusSnapshot } from '../components/lidoMoneyMachine/useStatus';
import type {
    FlowFidelity,
    FlowRuntimeState,
    IFlowDynamics,
    IFlowEdgeFlow,
    IFlowMachineDescriptor,
    IFlowStepDynamics,
    IFlowSubInputReading,
    IFlowVaultBalance,
} from './flowGraphTypes';

const tokenSymbol = (token: TokenInfo): string =>
    token.symbol ?? `${token.address.slice(0, 6)}…`;

/** Scale a base-unit amount to a display number (token decimals, fallback 18). */
const toNumber = (amount: bigint, decimals: number | null): number =>
    Number(amount) / 10 ** (decimals ?? 18);

const fidelityOf = (p: Provenance): FlowFidelity => {
    if (p === 'opaque' || p === 'downstream-of-opaque') {
        return 'opaque';
    }
    if (p === 'estimated-via-quoter' || p === 'estimated-via-oracle') {
        return 'estimated';
    }
    return 'real';
};

/** An amount is only shown when its provenance is knowable; opaque → null. */
const amountFor = (
    amount: bigint,
    decimals: number | null,
    fidelity: FlowFidelity,
): number | null => (fidelity === 'opaque' ? null : toNumber(amount, decimals));

/** Compact a simulator `reason` to a short badge phrase. */
const compactReason = (reason: string | undefined): string | undefined => {
    if (!reason) {
        return undefined;
    }
    if (reason.startsWith('oracle stale')) {
        return 'oracle stale';
    }
    if (reason.startsWith('same epoch')) {
        return 'already dispatched';
    }
    if (reason === 'gate closed') {
        return 'gate closed';
    }
    if (reason.startsWith('pool ratio')) {
        return 'pool drift';
    }
    if (reason.includes('budget') && reason.includes('0')) {
        return 'no budget';
    }
    return reason.length > 32 ? `${reason.slice(0, 29)}…` : reason;
};

const stateForStep = (step: Step | undefined): FlowRuntimeState => {
    if (!step) {
        return 'idle';
    }
    switch (step.status) {
        case 'executed':
            return 'firing';
        case 'skipped-paused':
            return 'skipped';
        case 'no-op':
            return step.reason === 'gate closed' ? 'blocked' : 'idle';
        default:
            return 'idle';
    }
};

/**
 * Every token the vault gains back from this step (its net products, looped back
 * to the DAO), plus any genuine outbound transfer to a non-vault address
 * (flagged `external`). One arrow per output — nothing collapsed or hidden.
 */
const outFlowsForStep = (step: Step): IFlowEdgeFlow[] => {
    const consumedAddrs = new Set(
        step.externalCalls
            .flatMap((c) => c.consumes)
            .map((c) => c.token.address.toLowerCase()),
    );
    const outs: IFlowEdgeFlow[] = [];
    const seen = new Set<string>();
    for (const produce of step.externalCalls.flatMap((c) => c.produces)) {
        // A token that is also consumed this step is an intermediate, not a net
        // product back to the vault — skip it.
        if (consumedAddrs.has(produce.token.address.toLowerCase())) {
            continue;
        }
        const symbol = tokenSymbol(produce.token);
        if (seen.has(symbol)) {
            continue;
        }
        seen.add(symbol);
        const fidelity = fidelityOf(produce.provenance);
        outs.push({
            token: symbol,
            amount: amountFor(produce.amount, produce.token.decimals, fidelity),
            fidelity,
        });
    }
    if (outs.length > 0) {
        return outs;
    }
    // Transfer / burn / epoch-transfer strategies: the outbound transfer is a
    // genuine external distribution out of the DAO.
    const dao = step.before.dao.toLowerCase();
    const outbound = step.transfers.find((t) => t.to.toLowerCase() !== dao);
    if (outbound) {
        const fidelity = fidelityOf(outbound.provenance);
        return [
            {
                token: tokenSymbol(outbound.token),
                amount: amountFor(
                    outbound.amount,
                    outbound.token.decimals,
                    fidelity,
                ),
                fidelity,
                external: true,
                to: outbound.to,
            },
        ];
    }
    return [];
};

/** Tokens this step consumes (budget + external-call consumes), deduped. */
const inFlowsForStep = (
    step: Step,
    streamTokenSymbol: string | undefined,
): IFlowEdgeFlow[] => {
    const ins: IFlowEdgeFlow[] = [];
    const push = (token: TokenInfo, amount: bigint, provenance: Provenance) => {
        const symbol = tokenSymbol(token);
        if (ins.some((i) => i.token === symbol)) {
            return;
        }
        const fidelity = fidelityOf(provenance);
        ins.push({
            token: symbol,
            amount: amountFor(amount, token.decimals, fidelity),
            fidelity,
            perEpoch: symbol === streamTokenSymbol,
        });
    };
    // External-call `consumes` are what the leg ACTUALLY draws — take them
    // first. The budget is only the allowance/ceiling: a full LDO budget can be
    // 11k while UniV2 only pairs ~2.3k against the streamed wstETH (the binding
    // side) and the rest stays in the vault. Showing the budget as the draw
    // overstated the spend and made the net-to-DAO wildly negative.
    for (const call of step.externalCalls) {
        for (const c of call.consumes) {
            push(c.token, c.amount, c.provenance);
        }
    }
    // Budget token only if no external call already drew it (transfer / burn /
    // epoch-transfer / CoW presign have no `consumes`, so the budget IS the draw).
    if (step.budget) {
        push(step.budget.token, step.budget.amount, step.budget.provenance);
    }
    return ins;
};

/** Build the per-input live readings aligned to a descriptor step's inputs. */
const readingsForStep = (
    snapshot: StatusSnapshot,
    descriptorStep: IFlowMachineDescriptor['steps'][number],
): IFlowSubInputReading[] =>
    descriptorStep.inputs.map((input) => {
        if (input.role === 'budget') {
            const budget = snapshot.budgets.find(
                (b) =>
                    b.strategyAddress.toLowerCase() ===
                    descriptorStep.address.toLowerCase(),
            );
            if (!budget) {
                return {};
            }
            const reading = {
                token: tokenSymbol(budget.token),
                reading: toNumber(budget.amount, budget.token.decimals),
            };
            // Stream-until budgets meter a per-epoch slice; give that slice
            // context with the live burn-down runway (epochs left to the
            // target, or the floored-drain note once the target is passed). The
            // `reading` above already IS the per-epoch slice (`budget()`).
            const stream = snapshot.stream;
            if (input.kind === 'streamUntil' && stream) {
                const remaining = Number(stream.remaining);
                const detail =
                    remaining > 0
                        ? `streams a slice / epoch · ${remaining} epoch${remaining === 1 ? '' : 's'} to target`
                        : `past target · capped at balance ÷ ${stream.floorEpochs}/epoch`;
                return { ...reading, detail };
            }
            return reading;
        }
        if (input.role === 'gate') {
            const gate = snapshot.gate;
            if (!gate) {
                return {};
            }
            // The gate fails for TWO distinct reasons: the price is below the
            // floor, OR the oracle reading is too old (`block.timestamp >
            // updatedAt + maxStaleness`). Distinguish them so a stale-but-fine
            // price isn't mislabelled "below floor": if the live price is at/above
            // the threshold yet the gate still fails, it's staleness.
            const belowFloor =
                gate.price != null && gate.price < gate.threshold;
            const reason = gate.passes
                ? 'price above floor'
                : belowFloor
                  ? 'price below floor'
                  : 'oracle price stale — refresh it';
            return {
                status: gate.passes ? 'open' : 'closed',
                detail: reason,
            };
        }
        // epoch
        const epoch = snapshot.stream?.currentEpoch;
        return epoch != null ? { epoch: Number(epoch) } : {};
    });

export interface IToLiveDynamicsParams {
    descriptor: IFlowMachineDescriptor;
    snapshot: StatusSnapshot;
}

/**
 * Project a {@link StatusSnapshot} onto {@link IFlowDynamics} for the given
 * descriptor. Per-input readings come from the live RPC reads; per-step
 * state + token in/out flows come from the simulated next dispatch (when
 * available) so the canvas can infer edges and animate active legs.
 */
export const toLiveDynamics = (
    params: IToLiveDynamicsParams,
): IFlowDynamics => {
    const { descriptor, snapshot } = params;
    const flow: FlowGraph | null = snapshot.nextDispatch;
    const streamTokenSymbol = snapshot.stream
        ? tokenSymbol(snapshot.stream.token)
        : undefined;

    const stepByAddress = new Map<string, Step>();
    for (const step of flow?.steps ?? []) {
        stepByAddress.set(step.strategyRef.address.toLowerCase(), step);
    }

    const steps: IFlowStepDynamics[] = descriptor.steps.map(
        (descriptorStep) => {
            const step = stepByAddress.get(
                descriptorStep.address.toLowerCase(),
            );
            const state = stateForStep(step);
            const blocked = state === 'blocked';

            let badge: string | undefined;
            if (step) {
                if (blocked || step.status === 'no-op') {
                    badge = compactReason(step.reason);
                } else if (state === 'skipped') {
                    badge = 'paused';
                }
            }

            return {
                address: descriptorStep.address,
                index: descriptorStep.index,
                state,
                badge,
                blocked,
                inputReadings: readingsForStep(snapshot, descriptorStep),
                outs: step ? outFlowsForStep(step) : undefined,
                ins: step ? inFlowsForStep(step, streamTokenSymbol) : undefined,
                skipReason: step?.reason,
            };
        },
    );

    const balances: IFlowVaultBalance[] = snapshot.balances
        .filter((b) => b.amount > 0n)
        .map((b) => ({
            token: tokenSymbol(b.token),
            amount: toNumber(b.amount, b.token.decimals),
        }));

    return { runId: null, steps, balances };
};

/** Narrow re-export to keep the producer's address typing honest at call sites. */
export type { Address };

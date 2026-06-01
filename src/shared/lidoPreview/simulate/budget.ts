// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import type { Provenance, TokenInfo } from '../types/primitives';
import type { BudgetNode } from '../types/topology';
import { type ChainState, getBalance, getEpoch } from './chainState';

export type BudgetRead = {
    amount: bigint;
    token: TokenInfo;
    provenance: Provenance;
    vault: Address | null;
    /** Set when the simulated read would revert on-chain. */
    wouldRevert?: { reason: string };
};

/**
 * Model a budget's `budget()` call purely from the topology + chain state.
 * Never hits the chain — the ChainState has already been fetched.
 */
export function readBudget(node: BudgetNode, state: ChainState): BudgetRead {
    switch (node.kind) {
        case 'budget.full': {
            const amount = getBalance(state, node.vault, node.token.address);
            return {
                amount,
                token: node.token,
                provenance: 'deterministic',
                vault: node.vault,
            };
        }
        case 'budget.required': {
            const actual = getBalance(state, node.vault, node.token.address);
            const wouldRevert =
                actual < node.requiredAmount
                    ? {
                          reason: `vault balance ${actual} < requiredAmount ${node.requiredAmount}`,
                      }
                    : undefined;
            return {
                amount: node.requiredAmount,
                token: node.token,
                provenance: 'deterministic',
                vault: node.vault,
                ...(wouldRevert === undefined ? {} : { wouldRevert }),
            };
        }
        case 'budget.lido.stream-until': {
            // `balance / max(targetEpoch − currentEpoch, floorEpochs)`.
            // The denominator's anti-spike floor caps the per-tick drain past
            // `targetEpoch` at `balance / floorEpochs`.
            const balance = getBalance(state, node.vault, node.token.address);
            if (balance === 0n) {
                return {
                    amount: 0n,
                    token: node.token,
                    provenance: 'deterministic',
                    vault: node.vault,
                };
            }
            const currentEpoch = getEpoch(state, node.epochProvider.address);
            if (currentEpoch === undefined) {
                return {
                    amount: 0n,
                    token: node.token,
                    provenance: 'opaque',
                    vault: node.vault,
                    wouldRevert: {
                        reason: 'epoch provider not in chain state',
                    },
                };
            }
            const remaining =
                node.targetEpoch > currentEpoch
                    ? node.targetEpoch - currentEpoch
                    : 0n;
            const floor = BigInt(node.floorEpochs);
            const denom = remaining > floor ? remaining : floor;
            const amount = denom === 0n ? 0n : balance / denom;
            return {
                amount: amount < balance ? amount : balance,
                token: node.token,
                provenance: 'deterministic',
                vault: node.vault,
            };
        }
        case 'budget.unknown':
            return {
                amount: 0n,
                token: node.token,
                provenance: 'opaque',
                vault: null,
            };
    }
}

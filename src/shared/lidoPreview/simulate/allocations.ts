// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';
import type { Provenance } from '../types/primitives';
import type { SplitterNode } from '../types/topology';

const RATIO_BASE = 1_000_000n;

export type Allocation = {
    recipient: Address;
    amount: bigint;
    provenance: Provenance;
};

export type AllocationResult = {
    allocations: Allocation[];
    /** The portion of the budget not distributed (remainder, dust, etc.). */
    residual: bigint;
    provenance: Provenance;
};

/**
 * Pure model of a splitter's `allocations(total)` call. Matches the Solidity
 * arithmetic exactly for the built-in splitters so a simulator can predict
 * exactly what a dispatch will transfer.
 */
export function splitAllocations(
    node: SplitterNode,
    total: bigint,
): AllocationResult {
    switch (node.kind) {
        case 'splitter.solo':
            return {
                allocations: [
                    {
                        recipient: node.recipient,
                        amount: total,
                        provenance: 'deterministic',
                    },
                ],
                residual: 0n,
                provenance: 'deterministic',
            };

        case 'splitter.equal': {
            const count = BigInt(node.recipients.length);
            if (count === 0n) {
                return {
                    allocations: [],
                    residual: total,
                    provenance: 'deterministic',
                };
            }
            const share = total / count;
            const distributed = share * count;
            return {
                allocations: node.recipients.map((recipient) => ({
                    recipient,
                    amount: share,
                    provenance: 'deterministic' as Provenance,
                })),
                residual: total - distributed,
                provenance: 'deterministic',
            };
        }

        case 'splitter.ratio': {
            let distributed = 0n;
            const allocations = node.entries.map(({ recipient, ratio }) => {
                const amount = (total * BigInt(ratio)) / RATIO_BASE;
                distributed += amount;
                return {
                    recipient,
                    amount,
                    provenance: 'deterministic' as Provenance,
                };
            });
            return {
                allocations,
                residual: total - distributed,
                provenance: 'deterministic',
            };
        }

        case 'splitter.unknown':
            return { allocations: [], residual: total, provenance: 'opaque' };
    }
}

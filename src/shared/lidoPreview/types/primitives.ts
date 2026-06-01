// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

import type { Address } from 'viem';

/**
 * Minimal token descriptor. `null` for symbol/decimals indicates the read
 * failed or the token is native ETH (`address(0)`).
 */
export type TokenInfo = {
    address: Address;
    symbol: string | null;
    decimals: number | null;
};

/**
 * Source of a simulated numerical value, so the UI can distinguish exact
 * from estimated from unknown.
 *
 * - `deterministic`          — pure math (transfer, burn, checkpoint).
 * - `estimated-via-quoter`   — on-chain quoter (Uniswap V3 QuoterV2, etc.).
 * - `estimated-via-oracle`   — strategy's configured price oracle.
 * - `opaque`                 — unknown component; prediction unavailable.
 * - `downstream-of-opaque`   — follows an opaque step, so its inputs
 *                              (and therefore outputs) are uncertain.
 * - `override`               — caller supplied the value directly.
 */
export type Provenance =
    | 'deterministic'
    | 'estimated-via-quoter'
    | 'estimated-via-oracle'
    | 'opaque'
    | 'downstream-of-opaque'
    | 'override';

/** Strip the `org.aragon.` prefix shared by every built-in *Id() string. */
export function kindFromId(id: string): string {
    const prefix = 'org.aragon.';
    return id.startsWith(prefix) ? id.slice(prefix.length) : id;
}

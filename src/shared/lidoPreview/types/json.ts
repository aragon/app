// Vendored from dao-launchpad@f/lido-demo:lido/preview/lib/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Upstream package: @aragon/lido-preview (private).

// JSON (de)serialization for artifacts containing bigints.
//
// Runtime types use native bigint so the simulator can do arithmetic
// directly. At JSON boundaries, bigints become decimal strings. We don't
// auto-revive them on parse — that requires a schema — consumers that want
// typed objects back should use a schema-aware parser.

/** `JSON.stringify` replacer: encodes bigints as decimal strings. */
export const jsonReplacer = (_key: string, value: unknown): unknown =>
    typeof value === 'bigint' ? value.toString() : value;

/** Convenience around `JSON.stringify(value, jsonReplacer, space)`. */
export function stringify(value: unknown, space: number | string = 2): string {
    return JSON.stringify(value, jsonReplacer, space);
}

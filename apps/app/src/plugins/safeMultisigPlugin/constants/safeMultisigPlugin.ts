/**
 * Plugin id an external Safe body resolves to. `PluginId` and `PluginInterfaceType` share one
 * string namespace, so the id is namespaced under the existing `external` id rather than a bare
 * `safe` that could collide with a future backend interface type.
 *
 * A Safe is not installable and has no repository addresses: this id is only ever used to register
 * slot components and functions, never with `registerPlugin`.
 */
export const safeBodyPluginId = 'external-safe';

/**
 * Poll cadence of the Safe reads while the Safe queue holds a live transaction. An idle body card
 * does not poll at all — it refreshes on window focus, and polling pauses on an unfocused tab.
 *
 * Two queries poll at this cadence, so every active viewer of a live queue costs
 * `2 * 3600 / (interval / 1000)` upstream calls per hour against one shared, rate-limited API key.
 * Nothing depends on the exact value; it trades how fast an owner sees a co-signer's signature
 * against quota spend.
 */
export const safeBodyPollInterval = 30_000;

/**
 * Poll cadence of the indexer while waiting for an executed report to be attributed.
 */
export const safeIndexingPollInterval = 1000;

/**
 * How long the action stays held waiting for an executed report to be indexed. The status endpoint
 * answers `{ isProcessed: false }` for any hash it cannot attribute, so a stalled indexer is
 * indistinguishable from one that is merely slow and would otherwise hold the card forever. On
 * expiry the hold is released with an explanation rather than leaving a permanent spinner.
 */
export const safeIndexingTimeout = 60_000;

/**
 * Plugin id a generic (non-Safe) external body resolves to. Kept beside `safeBodyPluginId` because
 * both live in the same string namespace and the resolver switches between them; a plain constant
 * living in a client component would drag react-hook-form into server code.
 */
export const externalPluginId = 'external';

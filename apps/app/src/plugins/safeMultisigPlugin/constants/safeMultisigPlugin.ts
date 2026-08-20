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
 * does not poll at all — it refreshes on window focus.
 */
export const safeBodyPollInterval = 15_000;

/**
 * Plugin id a generic (non-Safe) external body resolves to. Kept beside `safeBodyPluginId` because
 * both live in the same string namespace and the resolver switches between them; a plain constant
 * living in a client component would drag react-hook-form into server code.
 */
export const externalPluginId = 'external';

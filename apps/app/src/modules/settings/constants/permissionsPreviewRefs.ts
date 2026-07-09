/**
 * Preview-only address markers used by {@link permissionsMocks}.
 *
 * The permissions list swaps these markers for the viewed DAO's own address and
 * its installed plugin addresses at render time, so the sample rows resolve to
 * real names, tags and avatars for whichever DAO is being previewed instead of
 * hard-coding a specific DAO. Real backend responses never contain these values,
 * so the swap is a no-op for live data.
 */
const previewRef = (suffix: string): string => `0x${suffix.padStart(40, '0')}`;

export const PermissionsPreviewRef = {
    /** Resolves to the active account's DAO address. */
    self: previewRef('5e1f'),
    /** Resolves to the active account's first linked DAO. */
    linked: previewRef('11a0'),
    /** Resolves to the first installed plugin of the active account. */
    plugin0: previewRef('9100'),
    /** Resolves to the second installed plugin of the active account. */
    plugin1: previewRef('9101'),
} as const;

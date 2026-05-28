/** Button labels MetaMask may show on notification popups (exact match). */
export const MM_PRIMARY_ACTION_NAMES = [
    'Connect',
    'Switch network',
    'Approve',
    'Confirm',
    'Sign',
    'Sign transaction',
] as const;

/** Subset used before AppKit connect (network switch only). */
export const MM_NETWORK_SWITCH_ACTION_NAMES = [
    'Switch network',
    'Approve',
    'Confirm',
] as const;

const MM_PRIMARY_ACTION_PATTERN = MM_PRIMARY_ACTION_NAMES.map((name) =>
    name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
).join('|');

/** Fallback when no primary-action button matches by accessible name. */
export const MM_PRIMARY_ACTION_REGEX = new RegExp(
    `^(${MM_PRIMARY_ACTION_PATTERN})$`,
    'i',
);

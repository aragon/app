export const PermissionEntityExternalBrandId = {
    EOA: 'eoa',
    SAFE: 'safe',
    OTHER: 'other',
} as const;

export type PermissionEntityExternalBrandId =
    (typeof PermissionEntityExternalBrandId)[keyof typeof PermissionEntityExternalBrandId];

export type PermissionEntityLayer =
    | 'dao'
    | 'topLevelPlugin'
    | 'processInternal'
    | 'condition'
    | 'externalActor'
    | 'historicalPlugin'
    | 'contract'
    | 'unknown';

export type PermissionEntityRole = 'who' | 'where' | 'condition';

export type PermissionEntityStatus =
    | 'installed'
    | 'uninstalled'
    | 'historical'
    | 'unknown';

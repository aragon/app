export const PermissionEntityBrandId = {
    EOA: 'eoa',
    SAFE: 'safe',
    OTHER: 'other',
} as const;

export type PermissionEntityBrandId =
    (typeof PermissionEntityBrandId)[keyof typeof PermissionEntityBrandId];

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

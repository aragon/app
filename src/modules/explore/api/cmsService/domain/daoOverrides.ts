export interface IDaoOverridePluginMetadata {
    address: string;
    name: string;
    comment?: string;
}

export interface IDaoOverride {
    daoName?: string;
    comment?: string;
    pluginsToHide?: IDaoOverridePluginMetadata[];
}

export type DaoOverridesMap = Partial<Record<string, IDaoOverride>>;

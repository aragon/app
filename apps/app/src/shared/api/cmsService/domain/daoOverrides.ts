/**
 * Metadata for a plugin entry in DAO overrides (e.g. in pluginsToHide).
 * Used by {@link daoVisibilityUtils.filterHiddenPlugins} for address matching only.
 */
export interface IDaoOverridePluginMetadata {
    /** Plugin contract address. Required for filtering; comparison is case-insensitive. */
    address: string;
    /** Human-readable name. Not used by app; for CMS editors only. */
    name?: string;
    /** Note for CMS editors. Not used by app. */
    comment?: string;
}

/**
 * CMS-driven overrides for a single DAO.
 * Only `pluginsToHide` is read by the app; other fields are for CMS/future use.
 */
export interface IDaoOverride {
    /** Display name override for the DAO. Not used by app yet. */
    daoName?: string;
    /** Note for CMS editors. Not used by app. */
    comment?: string;
    /** Plugins to hide in the UI for this DAO. Only field used by the app (via daoVisibilityUtils). */
    pluginsToHide?: IDaoOverridePluginMetadata[];
    /**
     * Nav links to hide in the UI for this DAO.
     * Mainly for hiding "default" nav links, "plugin" nav links could be hidden via `pluginsToHide` instead.
     *
     * @example ['assets', 'settings']
     */
    navLinksToHide?: string[];
}

/**
 * Map of DAO IDs to their override config. Loaded from CMS (dao-overrides.json).
 * Keys are DAO IDs; values are only read for `pluginsToHide` in the current codebase.
 */
export type DaoOverridesMap = Partial<Record<string, IDaoOverride>>;

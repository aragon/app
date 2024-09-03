export interface IUseGovernanceSettingsParams<TSettings = unknown> {
    /**
     * ID of the DAO to parse the settings for.
     */
    daoId: string;
    /**
     * Plugin-specific settings object to be parsed. The plugin-specific hook will fetch the settings dynamically
     * when the settings object is undefined.
     */
    settings?: TSettings;
}

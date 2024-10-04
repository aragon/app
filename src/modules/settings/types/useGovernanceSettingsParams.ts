export interface IUseGovernanceSettingsParams<TSettings = unknown> {
    /**
     * ID of the DAO to parse the settings for.
     */
    daoId: string;
    /**
     * Address of the DAO plugin to display the settings for.
     */
    pluginAddress: string;
    /**
     * Plugin-specific settings object to be parsed.
     */
    settings: TSettings;
}

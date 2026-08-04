export interface IPluginSettings {
    /**
     * Address of the plugin.
     */
    pluginAddress: string;
    /**
     * Set when the plugin is an alchemix objection stage, where members can only vote "No".
     */
    isObjection?: boolean;
}

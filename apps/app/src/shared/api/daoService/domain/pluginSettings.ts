export interface IPluginSettings {
    /**
     * Address of the plugin.
     */
    pluginAddress: string;
    /**
     * Set when the plugin is an objection stage, where members can only vote "No".
     */
    isObjection?: boolean;
}

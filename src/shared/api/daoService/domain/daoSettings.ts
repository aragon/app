export interface IDaoSettings<TSettings extends object = object> {
    /**
     * ID of the settings.
     */
    id: string;
    /**
     * Address of the DAO plugin.
     */
    pluginAddress: string;
    /**
     * Plugin subdomain of the DAO.
     */
    pluginSubdomain: string;
    /**
     * Plugin specific settings of the DAO.
     */
    settings: TSettings;
}

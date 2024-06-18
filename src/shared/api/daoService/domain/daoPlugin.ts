export interface IDaoPlugin {
    /**
     * Address of the plugin.
     */
    address: string;
    /**
     * Type of the plugin.
     */
    type: string;
    /**
     * Subdomain of the plugin.
     */
    subdomain: string;
}

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
    /**
     * Release number of the plugin.
     */
    release: string;
    /**
     * Build number of the plugin.
     */
    build: string;
}

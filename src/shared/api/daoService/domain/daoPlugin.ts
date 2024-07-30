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
     * Transaction hash of the plugin.
     */
    transactionHash: string;
    /**
     * Block number of the plugin.
     */
    blockNumber: number;
    /**
     * Implementation Address of the plugin.
     */
    implementationAddress: string;
    /**
     * Token address of the plugin.
     */
    tokenAddress: string;
    /**
     * Plugin setup repo address of the plugin.
     */
    pluginSetupRepoAddress: string;
    /**
     * Release number of the plugin.
     */
    release: string;
    /**
     * Build number of the plugin.
     */
    build: string;
}



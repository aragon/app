import type { IPluginSettings } from './pluginSettings';

export interface IDaoPlugin<TSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Address of the plugin.
     */
    address: string;
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
    /**
     * Defines if the plugin supports the "Proposal" interface and therefore is a governance process.
     */
    isProcess: boolean;
    /**
     * Defines if the plugin supports the "Membership" interface and therefore is a governance body.
     */
    isBody: boolean;
    /**
     * Defines if the plugin is installed on the DAO as a sub / child plugin.
     */
    isSubPlugin: boolean;
    /*
     * Settings of the DAO plugin.
     */
    settings: TSettings;
    /**
     * Address of the parent plugin's smart contract.
     */
    parentPlugin?: string;
}

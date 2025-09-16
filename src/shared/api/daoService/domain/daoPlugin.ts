import type { PluginInterfaceType } from './enum';
import type { IPluginSettings } from './pluginSettings';
import type { IResource } from './resource';

export interface IDaoPlugin<TSettings extends IPluginSettings = IPluginSettings> {
    /**
     * Name of the plugin.
     */
    name?: string;
    /**
     * Description of the plugin.
     */
    description?: string;
    /**
     * Links of the plugin.
     */
    links?: IResource[];
    /**
     * Key of the plugin used to prefix the incremental proposal IDs in a process.
     */
    processKey?: string;
    /**
     * Address of the plugin.
     */
    address: string;
    /**
     * Subdomain of the plugin.
     */
    subdomain: string;
    /**
     * Plugin interface type. Used as a plugin type identifier.
     */
    interfaceType: PluginInterfaceType;
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
    /**
     * Settings of the DAO plugin.
     */
    settings: TSettings;
    /**
     * Address of the parent plugin's smart contract.
     */
    parentPlugin?: string;
    /**
     * Block timestamp when the plugin was created.
     */
    blockTimestamp: number;
    /**
     * Transaction hash of the plugin creation.
     */
    transactionHash: string;
    /**
     * Human readable slug of the plugin.
     */
    slug: string;
    /**
     * CID of the IPFS file containing the plugin metadata.
     */
    metadataIpfs?: string;
    /**
     * Address of the condition contract.
     * When set, the process has restricted execution permissions (allowed actions are set).
     */
    conditionAddress?: string;
    /**
     * Address of the create proposal condition of the plugin.
     */
    proposalCreationConditionAddress?: string;
}

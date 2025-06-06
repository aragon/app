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
     * The voting escrow settings of the plugin.
     */
    // TODO: move to ITokenPluginSettingsEscrowSettings once backend makes change
    votingEscrow?: {
        /**
         * The address of the curve contract.
         */
        curveAddress: string;
        /**
         * The address of the exit queue contract.
         */
        exitQueueAddress: string;
        /**
         * The address of the voting escrow contract.
         */
        escrowAddress: string;
        /**
         * The address of the clock contract.
         */
        clockAddress: string;
        /**
         * The address of the NFT lock contract.
         */
        nftLockAddress: string;
        /**
         * The address of the underlying token contract.
         */
        underlying: string;
    };
}

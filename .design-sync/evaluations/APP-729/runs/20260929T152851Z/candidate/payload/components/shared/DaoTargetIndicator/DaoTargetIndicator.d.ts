import * as React from 'react';

/**
 * DaoTargetIndicator — from @aragon/app@1.39.1 (apps/app/src/shared/components/daoTargetIndicator/daoTargetIndicator.tsx).
 */
export interface DaoTargetIndicatorProps {
  /** The root DAO used to determine if there are linked accounts. */
  dao?: IDao;
  /** The plugin whose target DAO should be displayed. When provided, targetDaoAddress will be derived from the plugin. */
  plugin?: IDaoPlugin<IPluginSettings>;
  /** Explicit target DAO address. Used when plugin is not available (e.g., for policies). Takes precedence over plugin if bot */
  targetDaoAddress?: string;
  /** Size variant affecting text size. - undefined: no text class (inherits from parent, use in DefinitionList) - 'sm': text- */
  size?: "sm" | "xs";
}

export interface IDao {
    /**
     * Identifier of the DAO.
     */
    id: string;
    /**
     * Address of the DAO.
     */
    address: string;
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Name of the DAO.
     */
    name: string;
    /**
     * Description of the DAO.
     */
    description: string;
    /**
     * ENS name of the DAO (e.g. `my-dao.dao.eth`).
     */
    ens: string | null;
    /**
     * ENS subdomain of the DAO.
     */
    subdomain: string | null;
    /**
     * Avatar of the DAO or null when DAO has no avatar.
     */
    avatar: string | null;
    /**
     * OSx version of the DAO.
     */
    version: string;
    /**
     * Defines if the DAO is setup with plugins supported by the App or not.
     */
    isSupported: boolean;
    /**
     * Governance plugins of the DAO.
     */
    plugins: IDaoPlugin[];
    /**
     * Metrics of the DAO.
     */
    metrics: IDaoMetrics;
    /**
     * Links of the DAO.
     */
    links: IResource[];
    /**
     * DAO creation date by block timestamp (in seconds).
     */
    blockTimestamp: number;
    /**
     * Transaction hash of the DAO creation.
     */
    transactionHash: string;
    /**
     * Linked accounts (child DAOs) of this DAO.
     */
    linkedAccounts?: ILinkedAccountSummary[];
    /**
     * Creator information of the DAO.
     */
    creator?: IAddressInfo;
}

export enum Network {
    ETHEREUM_MAINNET = 'ethereum-mainnet',
    ETHEREUM_SEPOLIA = 'ethereum-sepolia',
    POLYGON_MAINNET = 'polygon-mainnet',
    BASE_MAINNET = 'base-mainnet',
    ARBITRUM_MAINNET = 'arbitrum-mainnet',
    CITREA_MAINNET = 'citrea-mainnet',
    HEMI_MAINNET = 'hemi-mainnet',
    ZKSYNC_MAINNET = 'zksync-mainnet',
    OPTIMISM_MAINNET = 'optimism-mainnet',
    CHILIZ_MAINNET = 'chiliz-mainnet',
    AVAX_MAINNET = 'avax-mainnet',
    KATANA_MAINNET = 'katana-mainnet',
    MONAD_MAINNET = 'monad-mainnet',
    ROBINHOOD_MAINNET = 'robinhood-mainnet',
}

export interface IDaoPlugin<
    TSettings extends IPluginSettings = IPluginSettings,
> {
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
     * Address of the DAO this plugin is installed on (when available from the backend).
     * For legacy APIs this may be undefined.
     */
    daoAddress?: string;
    /**
     * Subdomain of the plugin.
     */
    subdomain?: string;
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
     * Sub / child plugin addresses configured by this plugin.
     */
    subPlugins?: IDaoSubPlugin[];
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
    /**
     * Set to false if a plugin is not installed following standard OSx flow.
     */
    isSupported?: boolean;
}

export interface IResource {
    /**
     * Name of the resource.
     */
    name: string;
    /**
     * Url of the resource.
     */
    url: string;
}

export enum PluginInterfaceType {
    TOKEN_VOTING = 'tokenVoting',
    MULTISIG = 'multisig',
    ADMIN = 'admin',
    SPP = 'spp',
    GAUGE_VOTER = 'gauge',
    CAPITAL_DISTRIBUTOR = 'capitalDistributor',
    LOCK_TO_VOTE = 'lockToVote',
    CROSS_CHAIN_CONTROLLER = 'crossChainController',
    UNKNOWN = 'unknown',
}

export interface IDaoSubPlugin {
    /**
     * Addresses of the sub / child plugins used by a parent plugin.
     */
    addresses: string[];
    /**
     * Stage index where this subplugin group is configured, when applicable.
     */
    stageIndex?: number;
}

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

export interface IDaoMetrics {
    /**
     * Number of proposals created in the DAO.
     */
    proposalsCreated: number;
    /**
     * Number of members of the DAO.
     */
    members: number;
    /**
     * Total value locked of the DAO.
     */
    tvlUSD: string;
}

export interface ILinkedAccountSummary {
    /**
     * Identifier of the linked account.
     */
    id: string;
    /**
     * Address of the linked account.
     */
    address: string;
    /**
     * Network of the linked account.
     */
    network: Network;
    /**
     * Name of the linked account.
     */
    name: string;
    /**
     * Description of the linked account.
     */
    description: string;
    /**
     * ENS name of the linked account (e.g. `my-dao.dao.eth`).
     */
    ens: string | null;
    /**
     * ENS subdomain of the linked account.
     */
    subdomain: string | null;
    /**
     * Avatar of the linked account or null when linked account has no avatar.
     */
    avatar: string | null;
    /**
     * Metrics of the linked account.
     */
    metrics: IDaoMetrics;
    /**
     * Links of the linked account.
     */
    links: IResource[];
    /**
     * Linked account creation date by block timestamp (in seconds).
     */
    blockTimestamp: number;
    /**
     * Transaction hash of the linked account creation.
     */
    transactionHash: string;
}

export interface IAddressInfo {
    /**
     * Address of the struct.
     */
    address: string;
    /**
     * ENS linked to the address.
     */
    ens: string | null;
    /**
     * Avatar linked to the address.
     */
    avatar: string | null;
}

export declare const DaoTargetIndicator: React.ComponentType<DaoTargetIndicatorProps>;

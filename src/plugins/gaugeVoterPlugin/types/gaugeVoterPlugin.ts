import type { IDaoPlugin, IPluginSettings } from '@/shared/api/daoService';

export interface IGaugeVoterPluginTokenSettings {
    /**
     * Network identifier where the token lives.
     */
    network?: string;
    /**
     * Token standard (e.g. ERC20).
     */
    type?: string;
    /**
     * Address of the token contract.
     */
    address?: string;
    /**
     * Symbol for the token.
     */
    symbol?: string;
    /**
     * Name of the token.
     */
    name?: string;
    /**
     * Number of decimals the token uses.
     */
    decimals?: number;
    /**
     * Total supply string as provided by the backend.
     */
    totalSupply?: string;
    /**
     * Whether the token can be minted by the DAO.
     */
    mintableByDao?: boolean;
    /**
     * Optional URL with the token logo.
     */
    logo?: string;
    /**
     * Additional backend flags.
     */
    ignoreTransfer?: boolean;
    isGovernance?: boolean;
    underlying?: string | null;
    hasDelegate?: boolean;
}

export interface IGaugeVoterPluginSettings extends IPluginSettings {
    /**
     * Optional token metadata provided at the top level.
     */
    tokenSymbol?: string;
    /**
     * Structured token configuration returned by the backend.
     */
    token?: IGaugeVoterPluginTokenSettings;
    /**
     * Additional deployment stages information.
     */
    stages?: unknown[];
}

export interface IGaugeVoterPlugin
    extends IDaoPlugin<IGaugeVoterPluginSettings> {
    /**
     * List of supported gauge types for voting.
     */
    supportedGaugeTypes?: string[];
    /**
     * Minimum voting power required to participate in gauge voting.
     */
    minimumVotingPower?: string;
    /**
     * Whether to enable delegation for gauge voting.
     */
    enableDelegation?: boolean;
}

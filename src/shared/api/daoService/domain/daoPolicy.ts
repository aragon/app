import type { IToken } from '../../../../modules/finance/api/financeService';
import type { IResource } from './resource';

export interface IDaoPolicy {
    /**
     * Name of the policy.
     */
    name?: string;
    /**
     * Description of the policy.
     */
    description?: string;
    /**
     * Links of the policy.
     */
    links?: IResource[];
    /**
     * Key of the policy used for identification purposes.
     */
    processKey?: string;
    /**
     * Address of the policy plugin.
     */
    address: string;
    /**
     * Address of the DAO this policy is installed on.
     */
    daoAddress?: string;
    /**
     * Policy interface type.
     */
    interfaceType: PolicyInterfaceType;
    /**
     * Policy strategy.
     */
    strategy: {
        /**
         * Type of the strategy used in the policy.
         */
        type: PolicyStrategyType;
        /**
         * Strategy model used.
         */
        model?: IPolicyRatioModel | IPolicyAddressGaugeRatioModel;
        /**
         * Strategy source used.
         */
        source?: IPolicyDrainSource | IPolicyStreamBalanceSource;
    };
    /**
     * Release number of the plugin.
     */
    release: string;
    /**
     * Build number of the plugin.
     */
    build: string;
    /**
     * Block timestamp when the plugin was created.
     */
    blockTimestamp: number;
    /**
     * Transaction hash of the plugin creation.
     */
    transactionHash: string;
    /**
     * CID of the IPFS file containing the plugin metadata.
     */
    metadataIpfs?: string;
}

enum PolicyInterfaceType {
    ROUTER = 'ROUTER',
    CLAIMER = 'CLAIMER',
}

enum PolicyStrategyType {
    ROUTER = 'ROUTER',
    BURN_ROUTER = 'BURN_ROUTER',
    CLAIMER = 'CLAIMER',
    MULTI_DISPATCH = 'MULTI_DISPATCH',
}

enum PolicyStrategyModelType {
    RATIO = 'RATIO',
    GAUGE_RATIO = 'GAUGE_RATIO',
}

enum PolicyStrategySourceType {
    DRAIN = 'DRAIN',
    STREAM_BALANCE = 'STREAM_BALANCE',
}

interface IPolicySourceBase {
    /**
     * Source type.
     */
    type: PolicyStrategySourceType;
    /**
     * Source contract address.
     */
    address: string;
    /**
     * Address of a vault from which funds are consumed.
     */
    vaultAddress: string;
    /**
     * ERC20 token (or ETH) consumed from the vault.
     */
    token: IToken;
}

interface IPolicyDrainSource extends IPolicySourceBase {
    /**
     * Drain source type.
     */
    type: PolicyStrategySourceType.DRAIN;
}

interface IPolicyStreamBalanceSource extends IPolicySourceBase {
    /**
     * StreamBalance source type.
     */
    type: PolicyStrategySourceType.STREAM_BALANCE;
    /**
     * The rate at which tokens become usable (tokens / epoch)
     */
    amountPerEpoch: bigint;
    /**
     * If greater than zero, it limits the usable amount at any point in time.
     */
    maxSourceBalance?: bigint;
    /**
     * The length of an epoch's interval in seconds.
     */
    epochInterval: number;
}

interface IPolicyModelBase {
    /**
     * Source type.
     */
    type: PolicyStrategyModelType;
    /**
     * Model contract address.
     */
    address: string;
}

interface IPolicyRatioModel extends IPolicyModelBase {
    /**
     * Ratio model type.
     */
    type: PolicyStrategyModelType.RATIO;
    /**
     * Recipient addresses.
     */
    recipients: string[];
    /**
     * Ratio of total distributing amount which each recipient should get.
     */
    ratios: number[];
}

interface IPolicyAddressGaugeRatioModel extends IPolicyModelBase {
    /**
     * Gauge ratio model type.
     */
    type: PolicyStrategyModelType.GAUGE_RATIO;
    /**
     * Address of th eGaugeVoter contract.
     */
    gaugeVoterAddress: string;
}

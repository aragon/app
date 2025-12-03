import type { IAsset } from '@/modules/finance/api/financeService';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export enum StrategyType {
    CAPITAL_ROUTER = 'CAPITAL_ROUTER',
    CAPITAL_DISTRIBUTOR = 'CAPITAL_DISTRIBUTOR',
    DEFI_ADAPTER = 'DEFI_ADAPTER',
}

export enum RouterType {
    FIXED = 'FIXED',
    GAUGE = 'GAUGE',
    STREAM = 'STREAM',
    BURN = 'BURN',
}

export interface ISetupStrategyFormBase {
    /**
     * Type of the strategy to set up.
     */
    type: StrategyType;
    /**
     * ID of the source vault (DAO) from which assets will be routed.
     */
    sourceVault: string;
}

/////////////////////////////////
//// ROUTER
/////////////////////////////////

export interface ISetupStrategyFormRouter extends ISetupStrategyFormBase {
    /**
     * Capital router type of policy.
     */
    type: StrategyType.CAPITAL_ROUTER;
    /**
     *  Type of the router: fixed, stream, swap, ...
     */
    routerType: RouterType;
    /**
     * Distribution configuration for FIXED router type.
     */
    distributionFixed: IDistributionFixedForm;
    /**
     * Distribution configuration for STREAM router type.
     */
    distributionStream: IDistributionStreamForm;
    /**
     * Distribution configuration for GAUGE router type.
     */
    distributionGauge: IDistributionGaugeForm;
    /**
     * Distribution configuration for BURN router type.
     */
    distributionBurn: IDistributionBurnForm;
}

export interface IDistributionFormBase {
    /**
     * The asset to distribute.
     */
    asset?: IAsset;
}

export interface IDistributionFixedForm extends IDistributionFormBase {
    /**
     * List of recipients with their distribution ratios.
     */
    recipients: IRecipientRelative[];
}

export enum StreamingEpochPeriod {
    HOUR = 'HOUR',
    DAY = 'DAY',
    WEEK = 'WEEK',
}

export interface IDistributionStreamForm extends IDistributionFormBase {
    /**
     * List of recipients with their distribution amounts.
     */
    recipients: IRecipientRelative[];
    /**
     * Epoch duration.
     */
    epochPeriod: StreamingEpochPeriod;
}

export interface IDistributionGaugeForm extends IDistributionFormBase {
    gaugeVoterAddress: string;
}

export interface IDistributionBurnForm extends IDistributionFormBase {}

export interface IRecipientRelative extends ICompositeAddress {
    /**
     * Distribution ratio (0-100) for this recipient.
     */
    ratio: number;
}

export interface IRecipientAbsolute extends ICompositeAddress {
    /**
     * Distribution value - amount of tokens.
     */
    amount: number;
}

////////////////////////
// DEFI ADAPTER
////////////////////////

export interface ISetupStrategyFormDeFiAdapter extends ISetupStrategyFormBase {
    /**
     * Capital router type of policy.
     */
    type: StrategyType.DEFI_ADAPTER;
    /**
     *  TODO
     */
    defiType: string;
}

/**
 * Policy/strategy setup form type.
 */
export type ISetupStrategyForm = ISetupStrategyFormRouter | ISetupStrategyFormDeFiAdapter;

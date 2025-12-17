import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { IAsset } from '@/modules/finance/api/financeService';

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
    DEX_SWAP = 'DEX_SWAP',
    MULTI_DISPATCH = 'MULTI_DISPATCH',
    UNISWAP = 'UNISWAP',
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
    /**
     * Distribution configuration for DEX_SWAP router type.
     */
    distributionDexSwap: IDistributionDexSwapForm;
    /**
     * Distribution configuration for MULTI_DISPATCH router type.
     */
    distributionMultiDispatch: IDistributionMultiDispatchForm;
    /**
     * Distribution configuration for UNISWAP router type.
     */
    distributionUniswap: IDistributionUniswapForm;
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
     * List of recipients with their distribution ratios.
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

export interface IDistributionDexSwapForm extends IDistributionFormBase {
    targetTokenAddress: string;
    cowSwapSettlementAddress: string;
}

export interface IDistributionMultiDispatchForm {
    /*
     * List of router addresses to dispatch.
     */
    routerAddresses: ICompositeAddress[];
}

export interface IDistributionUniswapForm extends IDistributionFormBase {
    targetTokenAddress: string;
    uniswapRouterAddress: string;
}

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

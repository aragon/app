import type { IAsset } from '@/modules/finance/api/financeService';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export enum StrategyType {
    CAPITAL_ROUTER = 'CAPITAL_ROUTER',
    CAPITAL_DISTRIBUTOR = 'CAPITAL_DISTRIBUTOR',
    DEFI_ADAPTER = 'DEFI_ADAPTER',
}

export interface IRecipient extends ICompositeAddress {
    /**
     * Distribution ratio (0-100) for this recipient.
     */
    ratio: number;
}

export interface IDistributionForm {
    /**
     * The asset to distribute.
     */
    asset?: IAsset;
    /**
     * The amount per dispatch.
     */
    amount?: string;
    /**
     * List of recipients with their distribution ratios.
     */
    recipients: IRecipient[];
}

export interface IRecipient extends ICompositeAddress {
    /**
     * Distribution ratio (0-100) for this recipient.
     */
    ratio: number;
}

export interface IDistributionForm {
    /**
     * The asset to distribute.
     */
    asset?: IAsset;
    /**
     * The amount per dispatch.
     */
    amount?: string;
    /**
     * List of recipients with their distribution ratios.
     */
    recipients: IRecipient[];
}

export interface ISetupStrategyForm {
    /**
     * Type of the strategy to setup.
     */
    type: StrategyType;
    /**
     * ID of the source vault (DAO) from which assets will be routed.
     */
    sourceVault: string;
    /**
     * Distribution configuration.
     */
    distribution: IDistributionForm;
}

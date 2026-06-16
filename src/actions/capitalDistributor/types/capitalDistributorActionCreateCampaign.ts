import type {
    IProposalAction,
    IProposalActionInputData,
} from '@aragon/gov-ui-kit';
import type { IToken } from '@/modules/finance/api/financeService';
import type { IResource } from '@/shared/api/daoService';
import type { ICapitalDistributorCreateCampaignFormData } from '../components/capitalDistributorCreateCampaignActionCreate';
import type { CapitalDistributorActionType } from './enum/capitalDistributorActionType';

/**
 * Token fields hydrated onto decoded create-campaign actions by the backend
 * (subset of IToken returned by ProxyToken.pickFields()).
 */
export type ICreateCampaignActionToken = Pick<
    IToken,
    'address' | 'name' | 'symbol' | 'decimals' | 'logo' | 'priceUsd'
>;

/**
 * Campaign metadata hydrated onto decoded create-campaign actions by the backend
 * (result of Web3Utils.parseCampaignMetadata from the IPFS document).
 */
export interface ICreateCampaignActionMetadata {
    title?: string;
    description?: string;
    resources?: IResource[];
    type?: string;
}

/**
 * inputData shape for a decoded create-campaign action, extended with the
 * enrichment fields populated by the backend (see APP-720 / app-backend#1342).
 */
export interface ICreateCampaignActionInputDataExtended
    extends IProposalActionInputData {
    totalAmount?: string;
    claimersCount?: number;
    token?: ICreateCampaignActionToken;
    metadata?: ICreateCampaignActionMetadata;
}

export interface ICapitalDistributorActionCreateCampaign
    extends Omit<IProposalAction, 'type' | 'inputData'> {
    /**
     * The type of the proposal action.
     */
    type: CapitalDistributorActionType.CREATE_CAMPAIGN;
    /**
     * DAO id.
     */
    daoId: string;
    /**
     * Campaign details collected from the action form in create phase.
     */
    campaignDetails?: ICapitalDistributorCreateCampaignFormData;
    /**
     * Decoded calldata plus backend-hydrated campaign enrichment fields.
     */
    inputData?: ICreateCampaignActionInputDataExtended;
}

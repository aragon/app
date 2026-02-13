import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { ICapitalDistributorCreateCampaignFormData } from '../components/capitalDistributorCreateCampaignActionCreate';
import type { CapitalDistributorActionType } from './enum/capitalDistributorActionType';

export interface ICapitalDistributorActionCreateCampaign
    extends Omit<IProposalAction, 'type'> {
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
}

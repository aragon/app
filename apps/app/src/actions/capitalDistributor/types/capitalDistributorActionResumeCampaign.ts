import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import type { CapitalDistributorActionType } from './enum/capitalDistributorActionType';

export interface ICapitalDistributorActionResumeCampaign
    extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: CapitalDistributorActionType.RESUME_CAMPAIGN;
    /**
     * Campaign selected for resuming. Only in create form.
     */
    campaignToResume?: ICampaign;
}

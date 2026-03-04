import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import type { CapitalDistributorActionType } from './enum/capitalDistributorActionType';

export interface ICapitalDistributorActionPauseCampaign
    extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: CapitalDistributorActionType.PAUSE_CAMPAIGN;
    /**
     * Campaign selected for pausing. Only in create form.
     */
    campaignToPause?: ICampaign;
}

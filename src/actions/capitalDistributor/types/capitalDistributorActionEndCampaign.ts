import type { IProposalAction } from '@aragon/gov-ui-kit';
import type { ICampaign } from '@/plugins/capitalDistributorPlugin/api/capitalDistributorService';
import type { CapitalDistributorActionType } from './enum/capitalDistributorActionType';

export interface ICapitalDistributorActionEndCampaign
    extends Omit<IProposalAction, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: CapitalDistributorActionType.END_CAMPAIGN;
    /**
     * Campaign selected for ending. Only in create form.
     */
    campaignToEnd?: ICampaign;
}

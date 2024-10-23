import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IProposalActionWithdrawToken as IGukProposalActionWithdrawToken } from '@aragon/gov-ui-kit';

export interface IProposalActionWithdrawToken extends Omit<IGukProposalActionWithdrawToken, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.TRANSFER;
}

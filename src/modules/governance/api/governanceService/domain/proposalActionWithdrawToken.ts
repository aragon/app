import type { IProposalActionWithdrawToken as IGukProposalActionWithdrawToken } from '@aragon/gov-ui-kit';
import type { ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';

export interface IProposalActionWithdrawToken extends Omit<IGukProposalActionWithdrawToken, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.TRANSFER;
}

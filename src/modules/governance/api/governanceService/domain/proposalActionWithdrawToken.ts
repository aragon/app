import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IProposalActionWithdrawToken as IOdsProposalActionWithdrawToken } from '@aragon/ods';

export interface IProposalActionWithdrawToken extends Omit<IOdsProposalActionWithdrawToken, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.TRANSFER;
}

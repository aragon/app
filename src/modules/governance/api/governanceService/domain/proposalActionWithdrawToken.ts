import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IProposalActionWithdrawToken as OdsIProposalActionWithdrawToken } from '@aragon/ods';

export interface IProposalActionWithdrawToken extends Omit<OdsIProposalActionWithdrawToken, 'type'> {
    type: ProposalActionType.TRANSFER;
}

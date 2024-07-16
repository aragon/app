
import { ProposalActionWithdrawToken } from '@/modules/proposalActions/actions/proposalActionWithdrawToken/proposalActionWithdrawToken';
import { type IProposalAction } from '@/modules/proposalActions/proposalActionTypes/proposalAction';
import { type IProposalActionWithdrawToken } from '@/modules/proposalActions/proposalActionTypes/proposalActionTokenWithdraw';

class ProposalActionsUtils {
  public getActionComponent(action: IProposalAction) {
    if (this.isWithdrawTokenAction(action)) {
      return () => ProposalActionWithdrawToken({ action });
    }
    
    return null;
  }

  public isWithdrawTokenAction(action: IProposalAction): action is IProposalActionWithdrawToken {
    return action.type === 'withdrawToken';
  }

}

const proposalActionsUtils = new ProposalActionsUtils();

export default proposalActionsUtils;

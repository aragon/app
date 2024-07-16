import { type IProposalAction } from "@/modules/proposalActions/proposalActionTypes/proposalAction";
import { type ICompositeAddress } from "@aragon/ods";


export interface IProposalActionWithdrawToken extends IProposalAction {
  type: 'withdrawToken';
  sender: ICompositeAddress;
  receiver: ICompositeAddress;
  amount: string; 
  token: {
    name: string;
    symbol: string;
    decimals: number;
    logo: string;
    priceUsd: string;
  };
}

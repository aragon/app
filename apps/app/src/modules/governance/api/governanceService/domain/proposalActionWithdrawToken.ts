import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import type { IProposalAction } from './proposalAction';

export interface IProposalActionWithdrawTokenAsset {
    /**
     * Name of the token.
     */
    name: string;
    /**
     * Symbol of the token.
     */
    symbol: string;
    /**
     * Address of the token, not set for native-currency transfers.
     */
    address?: string;
    /**
     * URL of the token logo.
     */
    logo: string;
    /**
     * Token price in USD.
     */
    priceUsd: string;
    /**
     * Decimals of the token.
     */
    decimals: number;
}

export interface IProposalActionWithdrawToken extends IProposalAction {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.TRANSFER | ProposalActionType.TRANSFER_NATIVE;
    /**
     * Sender of the transfer (the DAO treasury).
     */
    sender: ICompositeAddress;
    /**
     * Receiver of the transfer.
     */
    receiver: ICompositeAddress;
    /**
     * Amount of tokens to transfer, in the token's smallest unit.
     */
    amount: string;
    /**
     * Details of the token to transfer.
     */
    token: IProposalActionWithdrawTokenAsset;
}

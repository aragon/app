import { type IToken } from '@/modules/finance/api/financeService';
import { type IProposalActionTokenMint as IGukProposalActionTokenMint } from '@aragon/gov-ui-kit';
import type { TokenProposalActionType } from './enum';

export interface ITokenActionTokenMint extends Omit<IGukProposalActionTokenMint, 'type' | 'receiver'> {
    /**
     * The type of the proposal action.
     */
    type: TokenProposalActionType.MINT;
    /**
     * The token minted.
     */
    token: IToken;
    /**
     * The receiver of the minted tokens.
     */
    receivers: {
        /**
         * The address of the receiver.
         */
        address: string;
        /**
         * The current balance of the receiver.
         */
        currentBalance: string;
        /**
         * The new balance of the receiver after the mint.
         */
        newBalance: string;
    };
}

import type { IToken } from '@/modules/finance/api/financeService';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { TokenProposalActionType } from './enum';

export interface ITokenActionTokenMint extends IProposalAction {
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
         * The ENS name of the receiver.
         */
        ens?: string;
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

import { type IToken } from '@/modules/finance/api/financeService';
import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IProposalActionTokenMint as IOdsProposalActionTokenMint } from '@aragon/ods';

export interface IProposalActionTokenMint extends Omit<IOdsProposalActionTokenMint, 'type' | 'receiver'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.MINT;
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

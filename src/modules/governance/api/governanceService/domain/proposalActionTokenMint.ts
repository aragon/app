import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IProposalActionTokenMint as OdsIProposalActionTokenMint } from '@aragon/ods';

export interface IProposalActionTokenMint extends Omit<OdsIProposalActionTokenMint, 'type'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.MINT;
    /**
     * The token to be minted.
     */
    token: {
        /**
         * The address of the token.
         */
        address: string;
        /**
         * The symbol of the token.
         */
        symbol: string;
        /**
         * The decimals of the token.
         */
        decimals: number;
    };
}

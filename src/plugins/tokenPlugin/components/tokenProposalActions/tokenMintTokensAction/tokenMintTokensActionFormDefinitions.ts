import type { ICompositeAddress } from '@aragon/gov-ui-kit';

export interface ITokenMintTokensFormData {
    /**
     * The address receiving the tokens.
     */
    receiver?: ICompositeAddress;
    /**
     * The amount of tokens to be minted.
     */
    amount?: string;
}

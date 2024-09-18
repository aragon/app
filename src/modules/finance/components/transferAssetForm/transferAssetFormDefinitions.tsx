import type { ICompositeAddress } from '@aragon/ods';
import type { IToken } from '../../api/financeService';

export interface ITransferAssetFormData {
    /**
     * The address receiving the tokens.
     */
    receiver?: ICompositeAddress;
    /**
     * The amount of tokens to be sent.
     */
    amount?: string;
    /**
     * The token to be transfered.
     */
    token?: IToken;
}

import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { IAsset } from '../../api/financeService';

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
    asset?: IAsset;
}

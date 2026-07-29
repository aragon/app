import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { IAssetInputFormData } from '../assetInput';

export interface ITransferAssetFormData extends IAssetInputFormData {
    /**
     * The address receiving the tokens.
     */
    receiver?: ICompositeAddress;
}

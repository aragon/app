import type { IAsset } from './asset';

export interface IBalance extends IAsset {
    /**
     * Balance amount of the specific asset.
     */
    balance: string;
}

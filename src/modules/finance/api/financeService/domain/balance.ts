import type { IAsset } from './asset';

export interface IBalance extends IAsset {
    amount: string;
    amountUsd: string; 
    daoAddress: `0x${string}`; 
    network: string;
    token: IAsset; 
    tokenAddress: `0x${string}`; 
}

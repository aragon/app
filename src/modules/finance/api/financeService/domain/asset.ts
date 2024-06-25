export interface IToken {
    address: string;
    decimals: number;
    logo: string;
    name: string;
    priceChangeOnDayUsd: string;
    priceUsd: string;
    symbol: string;
    type: string;
}

export interface IAsset {
    amount: string;
    amountUsd: string;
    daoAddress: string;
    network: string;
    token: IToken;
    tokenAddress: string;
}
import type { IToken } from '@/modules/finance/api/financeService';

export interface IBuildTokenWrapTransactionParams {
    /**
     * Wrapper governance token.
     */
    token: IToken;
    /**
     * Address receiving the tokens.
     */
    address: string;
    /**
     * Amount of tokens in WEI format to be wrapped / unwrapped.
     */
    amount: bigint;
}

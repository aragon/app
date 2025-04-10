import type { ITokenPluginSettingsToken } from '../../types';

export interface IBuildTokenWrapTransactionParams {
    /**
     * Wrapper governance token.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Address receiving the tokens.
     */
    address: string;
    /**
     * Amount of tokens in WEI format to be wrapped / unwrapped.
     */
    amount: bigint;
}

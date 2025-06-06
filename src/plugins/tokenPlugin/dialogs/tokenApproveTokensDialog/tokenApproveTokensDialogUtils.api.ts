import type { Hex } from 'viem';
import type { ITokenPluginSettingsToken } from '../../types';

export interface IBuildApproveTransactionParams {
    /**
     * Wrapper governance token.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Amount of tokens to be approved.
     */
    amount: bigint;
    /**
     * Spender address used in the approve function.
     */
    spender: Hex;
}

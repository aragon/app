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
     * First argument of the approve function, which is the address of the spender.
     */
    spender: Hex;
}

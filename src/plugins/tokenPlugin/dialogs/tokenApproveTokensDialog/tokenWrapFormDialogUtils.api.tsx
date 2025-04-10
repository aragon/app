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
}

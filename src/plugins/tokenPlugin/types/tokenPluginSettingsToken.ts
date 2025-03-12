import { type IToken } from '@/modules/finance/api/financeService';

export interface ITokenPluginSettingsToken extends IToken {
    /**
     * Defines if the token supports the delegation feature or not.
     */
    hasDelegate: boolean;
    /**
     * The address of the underlying token, only set when the underlying token does not support the ERC20Votes standards
     * and needs to be wrapped.
     */
    underlying: string | null;
}

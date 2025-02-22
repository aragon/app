import { type IToken } from '@/modules/finance/api/financeService';

export interface ITokenPluginSettingsToken extends IToken {
    /**
     * Defines if the token supports the delegation feature or not.
     */
    hasDelegate: boolean;
}

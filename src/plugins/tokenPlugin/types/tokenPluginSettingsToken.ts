import { type IToken } from '@/modules/finance/api/financeService';

export interface ITokenPluginSettingsToken extends IToken {
    /**
     * Features of the governance token.
     */
    features: {
        /**
         * Defines if the voting power of the token can be delegated or not.
         */
        delegation: boolean;
    };
}

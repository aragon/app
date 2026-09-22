import type { IToken } from '@/modules/finance/api/financeService';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { pluginMetaUtils } from '@/shared/utils/pluginMetaUtils';
import type { ITokenPluginSettingsToken } from '../../types';

export interface ITokenPluginHasExecutePermissionParams {
    /**
     * Token plugin to check if version has EXECUTE_PROPOSAL_PERMISSION auth modifier set in execute() smart contract function.
     */
    plugin: IDaoPlugin;
}

class TokenPluginUtils {
    getUnderlyingToken = (token: ITokenPluginSettingsToken): IToken => {
        if (token.underlying == null) {
            return token;
        }

        return {
            ...token,
            address: token.underlying,
            // Remove the "g" and "Governance" prefixes from the token symbol / name. The backend
            // returns null metadata for governance tokens without ERC20 metadata (e.g. Hats
            // adapters), in which case there is no prefix to strip and the values stay as they are.
            symbol: token.symbol?.slice(1) ?? token.symbol,
            name: token.name?.slice(11) ?? token.name,
        };
    };

    hasExecuteProposalPermissionModifier = (
        params: ITokenPluginHasExecutePermissionParams,
    ): boolean => {
        const { plugin } = params;
        const hasExecuteProposalPermissionGuard =
            pluginMetaUtils.isVersionGreaterOrEqualTo(plugin, {
                release: 1,
                build: 3,
            });

        return hasExecuteProposalPermissionGuard;
    };
}

export const tokenPluginUtils = new TokenPluginUtils();

import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import type {
    IGetMemberListParams,
    IGetTokenVotingMembershipParams,
} from '../../governanceService.api';

/**
 * Builds the token-voting membership query params from a plugin and its DAO.
 * Used by both the client member list and the members-page RSC prefetch —
 * the two MUST build byte-identical params, otherwise the query keys diverge
 * and the dehydrated server cache never resolves the client query.
 *
 * For linked account plugins the API call must target the linked account's
 * own daoId so the backend queries the correct DAO.
 *
 * `token` is only present on token-voting / lock-to-vote plugin settings and
 * `underlying` only on the token plugin's token — both are read defensively.
 * When absent the values route the query to the legacy backend.
 */
export const buildTokenVotingMembershipParams = (
    initialParams: IGetMemberListParams,
    plugin: IDaoPlugin,
    dao?: IDao,
): IGetTokenVotingMembershipParams => {
    const resolvedDaoId = daoUtils.resolvePluginDaoId(
        initialParams.queryParams.daoId,
        plugin,
        dao,
    );

    const { token } = plugin.settings as {
        token?: { address: string; underlying?: string | null };
    };

    return {
        ...initialParams,
        queryParams: {
            ...initialParams.queryParams,
            daoId: resolvedDaoId,
            network: dao?.network,
            pluginInterfaceType: plugin.interfaceType,
            tokenAddress: token?.address,
            tokenUnderlying: token?.underlying ?? null,
        },
    };
};

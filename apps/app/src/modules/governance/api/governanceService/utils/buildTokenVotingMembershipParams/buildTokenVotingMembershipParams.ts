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
 * The generic `IDaoPlugin` type says nothing about `settings.token`: it only
 * exists on token-voting and lock-to-vote settings, and its `underlying`
 * field only on the token plugin's token. Both reads are defensive:
 * - no `token` → `tokenAddress` is undefined, which `resolveMemberSource`
 *   routes to the legacy backend (the domain query needs the token contract);
 * - no `underlying` → normalized to `null`, which the routing predicate
 *   treats as a plain ERC-20 — the domain-eligible value. Wrapped/VE-adapter
 *   tokens set it and stay on the legacy backend.
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

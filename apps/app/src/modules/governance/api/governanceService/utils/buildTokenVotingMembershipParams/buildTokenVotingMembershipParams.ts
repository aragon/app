import type { IGetTokenVotingMembershipParams } from '@/modules/governance/api/tokenVotingMembershipService';
import {
    type IDao,
    type IDaoPlugin,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { IGetMemberListParams } from '../../governanceService.api';

const tokenMemberListPlugins: PluginInterfaceType[] = [
    PluginInterfaceType.TOKEN_VOTING,
    PluginInterfaceType.LOCK_TO_VOTE,
];

/**
 * Plugins whose member list renders through `TokenMemberListBase` and thus
 * consumes the token-voting membership query instead of the generic member
 * list. Which source serves that query is decided by the BFF, not here.
 */
export const isTokenMemberListPlugin = (plugin: IDaoPlugin): boolean =>
    tokenMemberListPlugins.includes(plugin.interfaceType);

/**
 * Builds the token-voting membership query params from a plugin and its DAO.
 * Used by both the client member list and the members-page RSC prefetch —
 * the two MUST build byte-identical params, otherwise the query keys diverge
 * and the dehydrated server cache never resolves the client query.
 *
 * For linked account plugins the query must target the linked account's own
 * daoId so that the correct DAO is queried.
 */
export const buildTokenVotingMembershipParams = (
    initialParams: IGetMemberListParams,
    plugin: IDaoPlugin,
    dao: IDao | undefined,
): IGetTokenVotingMembershipParams => {
    const { daoId, pluginAddress, page, pageSize } = initialParams.queryParams;

    return {
        queryParams: {
            daoId: daoUtils.resolvePluginDaoId(daoId, plugin, dao),
            pluginAddress,
            page,
            pageSize,
        },
    };
};

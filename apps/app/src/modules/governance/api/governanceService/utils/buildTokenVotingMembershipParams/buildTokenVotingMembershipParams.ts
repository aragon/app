import {
    type IDao,
    type IDaoPlugin,
    type IPluginSettings,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import type {
    IGetMemberListParams,
    IGetTokenVotingMembershipParams,
} from '../../governanceService.api';

export interface ITokenVotingMembershipPluginSettings extends IPluginSettings {
    /**
     * Governance token of the plugin. `underlying` is only set on the token
     * plugin's wrapped / VE-adapter governance tokens.
     */
    token: {
        address: string;
        underlying?: string | null;
    };
    /**
     * Voting-escrow settings, only set when the plugin's voting power comes
     * from escrow locks instead of plain ERC-20 balances.
     */
    votingEscrow?: unknown;
}

export interface IBuildTokenVotingMembershipParamsOptions {
    /**
     * Whether the aragon-domain source is enabled (feature flag). When false
     * every query is served by the legacy backend.
     */
    domainSourceEnabled: boolean;
}

const tokenMemberListPlugins: PluginInterfaceType[] = [
    PluginInterfaceType.TOKEN_VOTING,
    PluginInterfaceType.LOCK_TO_VOTE,
];

/**
 * Plugins whose member list renders through `TokenMemberListBase` and thus
 * consumes the token-voting membership query instead of the generic member
 * list.
 *
 * The guard narrows a generic plugin to the token-carrying settings this
 * module needs.
 */
export const isTokenMemberListPlugin = (
    plugin: IDaoPlugin,
): plugin is IDaoPlugin<ITokenVotingMembershipPluginSettings> =>
    tokenMemberListPlugins.includes(plugin.interfaceType);

/**
 * Builds the token-voting membership query params from a plugin and its DAO.
 * Used by both the client member list and the members-page RSC prefetch —
 * the two MUST build byte-identical params, otherwise the query keys diverge
 * and the dehydrated server cache never resolves the client query.
 *
 * For linked account plugins the API call must target the linked account's
 * own daoId so the backend queries the correct DAO.
 */
export const buildTokenVotingMembershipParams = (
    initialParams: IGetMemberListParams,
    plugin: IDaoPlugin<ITokenVotingMembershipPluginSettings>,
    dao: IDao | undefined,
    options: IBuildTokenVotingMembershipParamsOptions,
): IGetTokenVotingMembershipParams => {
    const resolvedDaoId = daoUtils.resolvePluginDaoId(
        initialParams.queryParams.daoId,
        plugin,
        dao,
    );

    const { token, votingEscrow } = plugin.settings;

    return {
        ...initialParams,
        queryParams: {
            ...initialParams.queryParams,
            daoId: resolvedDaoId,
            network: dao?.network,
            pluginInterfaceType: plugin.interfaceType,
            tokenAddress: token.address,
            tokenUnderlying: token.underlying ?? null,
            hasVotingEscrow: votingEscrow != null,
            domainSourceEnabled: options.domainSourceEnabled,
        },
    };
};

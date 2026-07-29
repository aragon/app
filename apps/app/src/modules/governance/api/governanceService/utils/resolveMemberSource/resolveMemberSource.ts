import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IGetTokenVotingMembershipQueryParams } from '../../governanceService.api';

/**
 * Networks whose token-voting member queries are served by the
 * aragon-domain BFF. Expand as more networks are indexed by Envio.
 */
export const DOMAIN_NETWORKS: ReadonlySet<Network> = new Set([
    Network.ETHEREUM_MAINNET,
]);

/**
 * Decides which backing source serves a token-voting member query.
 *
 * The aragon-domain only covers plain ERC-20 token-voting governance
 * tokens on the networks in `DOMAIN_NETWORKS`. Wrapped / VE-adapter tokens
 * (`tokenUnderlying != null`) and every other plugin type or network keep
 * using the legacy backend until the aragon-domain supports them.
 */
export const resolveMemberSource = (
    queryParams: IGetTokenVotingMembershipQueryParams,
): 'domain' | 'backend' => {
    const pluginAddress = queryParams.pluginAddress?.toLowerCase();
    const tokenAddress = queryParams.tokenAddress?.toLowerCase();
    const network = queryParams.network;
    const interfaceType = queryParams.pluginInterfaceType;
    const tokenUnderlying = queryParams.tokenUnderlying;

    const useDomain =
        pluginAddress != null &&
        tokenAddress != null &&
        network != null &&
        DOMAIN_NETWORKS.has(network) &&
        interfaceType === PluginInterfaceType.TOKEN_VOTING &&
        tokenUnderlying == null;

    return useDomain ? 'domain' : 'backend';
};

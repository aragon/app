import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import type { IGetMemberListQueryParams } from '../../governanceService.api';

/**
 * Networks whose token-voting member queries are served by the
 * aragon-subdomain BFF. Expand as more networks are indexed by Envio.
 */
export const SUBDOMAIN_NETWORKS: ReadonlySet<Network> = new Set([
    Network.ETHEREUM_MAINNET,
]);

/**
 * Decides which backing source serves a token-voting member query.
 *
 * The aragon-subdomain only covers plain ERC-20 token-voting governance
 * tokens on the networks in `SUBDOMAIN_NETWORKS`. Wrapped / VE-adapter tokens
 * (`tokenUnderlying != null`) and every other plugin type or network keep
 * using the legacy backend until the subdomain supports them.
 */
export const resolveMemberSource = (
    queryParams: IGetMemberListQueryParams,
): 'subdomain' | 'backend' => {
    const pluginAddress = queryParams.pluginAddress?.toLowerCase();
    const tokenAddress = queryParams.tokenAddress?.toLowerCase();
    const network = queryParams.network;
    const interfaceType = queryParams.pluginInterfaceType;
    const tokenUnderlying = queryParams.tokenUnderlying;

    const useSubdomain =
        pluginAddress != null &&
        tokenAddress != null &&
        network != null &&
        SUBDOMAIN_NETWORKS.has(network) &&
        interfaceType === PluginInterfaceType.TOKEN_VOTING &&
        tokenUnderlying == null;

    return useSubdomain ? 'subdomain' : 'backend';
};

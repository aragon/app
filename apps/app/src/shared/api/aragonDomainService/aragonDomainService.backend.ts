import 'server-only';
import { AragonDomain, EnvioClient, type RpcUrls } from '@aragon/aragon-domain';
import { resolveServerRpcUrl } from '@/modules/application/utils/proxyRpcUtils/resolveServerRpcUrl';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

export type AragonDomainController = ReturnType<typeof AragonDomain.load>;

/**
 * Networks the domain controller can read on-chain data from. Expand as more
 * networks are indexed by aragon-indexer.
 */
const domainRpcNetworks = [Network.ETHEREUM_MAINNET] as const;

/**
 * Server-side singleton wrapping aragon-domain.
 *
 * The domain is created lazily on first use (not at import time) so a
 * missing endpoint surfaces inside the API route's `try/catch` as a clean 500
 * rather than an opaque import-time crash. `apiToken` is optional on `EnvioClient`.
 */
class AragonDomainServiceBackend {
    private domain: AragonDomainController | undefined;

    getDomain = (): AragonDomainController => {
        if (this.domain == null) {
            const endpoint = process.env.NEXT_SECRET_ENVIO_GRAPHQL_ENDPOINT;
            const apiToken = process.env.NEXT_SECRET_ENVIO_API_TOKEN;

            if (endpoint == null) {
                throw new Error('Envio endpoint is not set');
            }

            const rpcUrls: RpcUrls = Object.fromEntries(
                domainRpcNetworks.map((network) => [
                    networkDefinitions[network].id,
                    resolveServerRpcUrl(network),
                ]),
            );

            this.domain = AragonDomain.load(
                new EnvioClient(endpoint, apiToken),
                rpcUrls,
            );
        }

        return this.domain;
    };
}

export const aragonDomainServiceBackend = new AragonDomainServiceBackend();

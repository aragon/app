import 'server-only';
import { AragonDomain, EnvioClient, type RpcUrls } from '@aragon/aragon-domain';
import { resolveServerRpcUrl } from '@/modules/application/utils/proxyRpcUtils/resolveServerRpcUrl';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';

type AragonDomainController = ReturnType<typeof AragonDomain.load>;

/**
 * Networks the domain controller can read on-chain data from. Expand as more
 * networks are indexed by Envio.
 */
const domainRpcNetworks = [Network.ETHEREUM_MAINNET] as const;

/**
 * Server-side singleton wrapping the Envio-backed Aragon domain controller.
 *
 * The controller is created lazily on first use (not at import time) so a
 * missing endpoint surfaces inside the API route's `try/catch` as a clean 500
 * rather than an opaque import-time crash. `apiToken` is optional on `EnvioClient`.
 *
 * Only the methods the app consumes are exposed, keeping the surface explicit.
 */
class AragonDomainServiceBackend {
    private controller: AragonDomainController | undefined;

    getMemberProfileTextRecords: AragonDomainController['getMemberProfileTextRecords'] =
        (dto) => this.getController().getMemberProfileTextRecords(dto);

    getTokenVotingMembership: AragonDomainController['getTokenVotingMembership'] =
        (dto) => this.getController().getTokenVotingMembership(dto);

    private getController = (): AragonDomainController => {
        if (this.controller == null) {
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

            this.controller = AragonDomain.load(
                new EnvioClient(endpoint, apiToken),
                rpcUrls,
            );
        }

        return this.controller;
    };
}

export const aragonDomainServiceBackend = new AragonDomainServiceBackend();

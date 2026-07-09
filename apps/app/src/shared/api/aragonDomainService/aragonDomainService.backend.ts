import 'server-only';
import { AragonDomain, EnvioClient } from '@aragon/aragon-domain';

type AragonDomainController = ReturnType<typeof AragonDomain.load>;

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

    private getController = (): AragonDomainController => {
        if (this.controller == null) {
            const endpoint = process.env.NEXT_SECRET_ENVIO_GRAPHQL_ENDPOINT;
            const apiToken = process.env.NEXT_SECRET_ENVIO_API_TOKEN;

            if (endpoint == null) {
                throw new Error('Envio endpoint is not set');
            }

            this.controller = AragonDomain.load(
                new EnvioClient(endpoint, apiToken),
            );
        }

        return this.controller;
    };
}

export const aragonDomainServiceBackend = new AragonDomainServiceBackend();

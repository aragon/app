import 'server-only';
import { AragonSubdomain, EnvioClient } from '@aragon/aragon-subdomain';

const endpoint = process.env.NEXT_SECRET_ENVIO_GRAPHQL_ENDPOINT;
const apiToken = process.env.NEXT_SECRET_ENVIO_API_TOKEN;

if (endpoint == null) {
    throw new Error('Envio endpoint is not set');
}

export const aragonSubdomainServiceBackend = AragonSubdomain.load(
    new EnvioClient(endpoint, apiToken),
);

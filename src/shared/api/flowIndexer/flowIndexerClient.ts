/**
 * Minimal GraphQL fetch client for the capital-flow-indexer (Envio/Hasura endpoint).
 * We intentionally avoid adding `graphql-request` as a dependency — the app already ships
 * with native `fetch`, and our single-query usage doesn't justify another 30kB in the bundle.
 *
 * Endpoint is configured via `NEXT_PUBLIC_FLOW_INDEXER_ENDPOINT`. When unset, callers should
 * gate the feature flag so this client is never invoked.
 */

export class FlowIndexerError extends Error {
    constructor(
        message: string,
        readonly status?: number,
        readonly errors?: unknown,
    ) {
        super(message);
        this.name = 'FlowIndexerError';
    }
}

export interface IFlowIndexerRequestOptions {
    signal?: AbortSignal;
}

interface IGraphQLResponse<T> {
    data?: T;
    errors?: Array<{ message: string; path?: readonly (string | number)[] }>;
}

export const getFlowIndexerEndpoint = (): string | undefined =>
    process.env.NEXT_PUBLIC_FLOW_INDEXER_ENDPOINT;

/**
 * Returns `true` when the feature flag **and** the endpoint are both configured. The Flow
 * dashboard uses this to decide whether to mount the Envio-backed provider branch.
 */
export const isFlowIndexerEnabled = (): boolean =>
    process.env.NEXT_PUBLIC_FLOW_USE_ENVIO === 'true' &&
    Boolean(getFlowIndexerEndpoint());

export const flowIndexerRequest = async <
    TData,
    TVariables extends Record<string, unknown>,
>(
    query: string,
    variables: TVariables,
    options: IFlowIndexerRequestOptions = {},
): Promise<TData> => {
    const endpoint = getFlowIndexerEndpoint();
    if (!endpoint) {
        throw new FlowIndexerError(
            'NEXT_PUBLIC_FLOW_INDEXER_ENDPOINT is not set — cannot query Envio.',
        );
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal: options.signal,
    });

    if (!response.ok) {
        throw new FlowIndexerError(
            `Flow indexer responded with HTTP ${response.status}`,
            response.status,
        );
    }

    const payload = (await response.json()) as IGraphQLResponse<TData>;
    if (payload.errors && payload.errors.length > 0) {
        throw new FlowIndexerError(
            `Flow indexer query failed: ${payload.errors.map((e) => e.message).join('; ')}`,
            response.status,
            payload.errors,
        );
    }
    if (!payload.data) {
        throw new FlowIndexerError('Flow indexer returned no data');
    }
    return payload.data;
};

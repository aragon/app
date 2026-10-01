import { GraphQLClient } from 'graphql-request';
import { EnvioClient } from './EnvioClient';

describe('EnvioClient', () => {
  const ENDPOINT = 'https://indexer.example.invalid/v1/graphql';

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('constructs without auth headers when no token is supplied', () => {
    const ctorSpy = vi.spyOn(GraphQLClient.prototype, 'setHeader');

    // Just constructing should not call setHeader; we look at the
    // GraphQLClient internals instead.
    const client = new EnvioClient(ENDPOINT);
    // Cast through unknown to inspect the private GraphQLClient.
    const inner = (
      client as unknown as { client: { requestConfig: { headers?: unknown } } }
    ).client;

    expect(inner.requestConfig.headers).toEqual({});
    // No setHeader is invoked.
    expect(ctorSpy).not.toHaveBeenCalled();
  });

  it('sets a Bearer authorization header when an apiToken is supplied', () => {
    const client = new EnvioClient(ENDPOINT, 'secret-token');
    const inner = (
      client as unknown as {
        client: { requestConfig: { headers?: Record<string, string> } };
      }
    ).client;

    expect(inner.requestConfig.headers).toEqual({
      Authorization: 'Bearer secret-token',
    });
  });

  it('delegates query() to the underlying GraphQLClient and returns the result', async () => {
    const payload = { Domain: [] };
    const requestSpy = vi
      .spyOn(GraphQLClient.prototype, 'request')
      .mockResolvedValue(payload);

    const client = new EnvioClient(ENDPOINT);
    const result = await client.query('query { Domain { id } }', {
      name: 'x.aragon.eth',
    });

    expect(result).toBe(payload);
    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(requestSpy).toHaveBeenCalledWith('query { Domain { id } }', {
      name: 'x.aragon.eth',
    });
  });

  it('forwards undefined variables when none are supplied', async () => {
    const requestSpy = vi
      .spyOn(GraphQLClient.prototype, 'request')
      .mockResolvedValue({});

    const client = new EnvioClient(ENDPOINT);
    await client.query('query { __typename }');

    expect(requestSpy).toHaveBeenCalledWith('query { __typename }', undefined);
  });

  it('wraps network/GraphQL failures in a descriptive Error', async () => {
    const cause = new Error('network down');
    vi.spyOn(GraphQLClient.prototype, 'request').mockRejectedValue(cause);

    const client = new EnvioClient(ENDPOINT);

    await expect(client.query('query { x }')).rejects.toThrow(
      'Envio GraphQL query failed',
    );

    // The original error is preserved on `.cause`.
    try {
      await client.query('query { x }');
    } catch (err) {
      expect((err as Error).cause).toBe(cause);
    }
  });
});

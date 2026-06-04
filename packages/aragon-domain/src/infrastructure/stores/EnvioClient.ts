import { GraphQLClient } from 'graphql-request';

/**
 * GraphQL client for querying the Envio HyperIndex API.
 */
export class EnvioClient {
  private readonly client: GraphQLClient;

  constructor(endpoint: string, apiToken?: string) {
    const headers: Record<string, string> = {};
    if (apiToken) {
      headers.Authorization = `Bearer ${apiToken}`;
    }
    this.client = new GraphQLClient(endpoint, { headers });
  }

  /**
   * Execute a GraphQL query.
   */
  async query(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<unknown> {
    try {
      return await this.client.request(document, variables);
    } catch (cause) {
      throw new Error('Envio GraphQL query failed', { cause });
    }
  }
}

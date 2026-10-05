import { AragonDomain, EnvioClient, type RpcUrls } from '../../src';
import { CHAIN_ID } from './constants';

export interface BuiltDomain {
  /** The public facade. Every integration test drives the stack through this. */
  domain: AragonDomain;
  /** Spy over `EnvioClient.query` — assert call count / variables against it. */
  query: ReturnType<typeof vi.fn>;
}

/**
 * Builds an `AragonDomain` backed by an `EnvioClient` whose `query` method
 * is replaced with a FIFO queue of canned responses (the GraphQLClient is
 * constructed but never touches the network).
 *
 * Envio responses are consumed in call order. Draining past the end is a
 * test bug, so it throws rather than returning `undefined`.
 *
 * `rpcUrls` defaults to a mainnet entry because `AragonDomain.load` refuses
 * to build without one; the ENS client is stubbed by the tests that need
 * it, so the URL is never dialled.
 */
export function buildDomain(
  responses: unknown[],
  rpcUrls: RpcUrls = { [CHAIN_ID]: 'https://unused.example.invalid' },
): BuiltDomain {
  const envio = new EnvioClient('https://unused.example.invalid');
  const queue = [...responses];
  const query = vi.fn(async () => {
    if (queue.length === 0) {
      throw new Error('EnvioClient.query called more times than expected');
    }
    return queue.shift();
  });
  vi.spyOn(envio, 'query').mockImplementation(query as never);

  return { domain: AragonDomain.load(envio, rpcUrls), query };
}

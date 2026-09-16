/**
 * Canned Envio responses for the `getMemberProfileTextRecords` flow.
 *
 * The store issues a single `Domain` query, so each scenario queues
 * exactly one of these builders.
 */

export interface TextRecord {
  /**
   * ENS text record key, e.g. `avatar` or `com.twitter`.
   */
  key: string;

  /**
   * The record's current value.
   */
  value: string;

  /**
   * Resolver version the record was written under. Defaults to `'0'`,
   * the version a fresh resolver starts at.
   */
  version?: string;
}

/**
 * A `Domain` response carrying a resolver with the given text records.
 */
export function domainResponse(
  name: string,
  texts: TextRecord[],
  resolverVersion = '0',
) {
  return {
    Domain: [
      {
        id: 'domain-id',
        name,
        resolver: {
          version: resolverVersion,
          texts: texts.map((t) => ({ version: '0', ...t })),
        },
      },
    ],
  };
}

/** The subdomain is unknown to the indexer — no `Domain` row at all. */
export function unknownDomainResponse() {
  return { Domain: [] };
}

/** The subdomain exists but has no resolver attached yet. */
export function noResolverResponse(name: string) {
  return { Domain: [{ id: 'domain-id', name, resolver: null }] };
}

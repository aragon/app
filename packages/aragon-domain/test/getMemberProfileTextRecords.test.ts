import assert from 'node:assert';
import { buildDomain } from './support/buildDomain';
import {
  domainResponse,
  noResolverResponse,
  unknownDomainResponse,
} from './support/fixtures/memberProfile';

const SUBDOMAIN = 'ea1.aragon.eth';

describe('AragonDomain.getMemberProfileTextRecords', () => {
  it('returns the live text records as a DTO list', async () => {
    const { domain } = buildDomain([
      domainResponse(SUBDOMAIN, [
        { key: 'avatar', value: 'ipfs://x' },
        { key: 'url', value: 'https://aragon.org' },
      ]),
    ]);

    const response = await domain.getMemberProfileTextRecords({
      subdomain: SUBDOMAIN,
    });

    assert(response.success, 'expected getMemberProfileTextRecords to succeed');
    expect(response.result).toEqual([
      { key: 'avatar', value: 'ipfs://x' },
      { key: 'url', value: 'https://aragon.org' },
    ]);
  });

  it('returns [] when the subdomain is unknown to the indexer', async () => {
    const { domain } = buildDomain([unknownDomainResponse()]);

    const response = await domain.getMemberProfileTextRecords({
      subdomain: SUBDOMAIN,
    });

    assert(response.success);
    expect(response.result).toEqual([]);
  });

  it('returns [] when the subdomain has no resolver yet', async () => {
    const { domain } = buildDomain([noResolverResponse(SUBDOMAIN)]);

    const response = await domain.getMemberProfileTextRecords({
      subdomain: SUBDOMAIN,
    });

    assert(response.success);
    expect(response.result).toEqual([]);
  });

  it('returns a failed response when the subdomain is not under .aragon.eth', async () => {
    // Rejected by the request mapper before any query is issued.
    const { domain, query } = buildDomain([]);

    const response = await domain.getMemberProfileTextRecords({
      subdomain: 'vitalik.eth',
    });

    expect(response.success).toBe(false);
    expect(query).not.toHaveBeenCalled();
  });
});

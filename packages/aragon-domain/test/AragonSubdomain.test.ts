import assert from 'node:assert';
import { AragonSubdomain, EnvioClient } from '../src';

/**
 * Builds an AragonSubdomain backed by an EnvioClient whose `query`
 * method is replaced with a FIFO queue of canned responses. The
 * underlying GraphQLClient is constructed but never used at the
 * network layer.
 */
function buildController(responses: unknown[]): AragonSubdomain {
  const envio = new EnvioClient('https://unused.example.invalid');
  const queue = [...responses];
  vi.spyOn(envio, 'query').mockImplementation(async () => {
    if (queue.length === 0) {
      throw new Error('EnvioClient.query called more times than expected');
    }
    return queue.shift() as never;
  });
  return AragonSubdomain.load(envio);
}

describe('AragonSubdomain', () => {
  describe('getMemberProfileTextRecords', () => {
    it('returns the live text records as a DTO list', async () => {
      const controller = buildController([
        {
          Domain: [
            {
              id: 'domain-id',
              name: 'ea1.aragon.eth',
              resolver: {
                version: '0',
                texts: [
                  { key: 'avatar', value: 'ipfs://x', version: '0' },
                  {
                    key: 'url',
                    value: 'https://aragon.org',
                    version: '0',
                  },
                ],
              },
            },
          ],
        },
      ]);

      const response = await controller.getMemberProfileTextRecords({
        subdomain: 'ea1.aragon.eth',
      });

      assert(
        response.success,
        'expected getMemberProfileTextRecords to succeed',
      );
      expect(response.result).toEqual([
        { key: 'avatar', value: 'ipfs://x' },
        { key: 'url', value: 'https://aragon.org' },
      ]);
    });

    it('returns [] when the subdomain is unknown to the indexer', async () => {
      const controller = buildController([{ Domain: [] }]);

      const response = await controller.getMemberProfileTextRecords({
        subdomain: 'ea1.aragon.eth',
      });

      assert(response.success);
      expect(response.result).toEqual([]);
    });

    it('returns [] when the subdomain has no resolver yet', async () => {
      const controller = buildController([
        {
          Domain: [{ id: 'domain-id', name: 'ea1.aragon.eth', resolver: null }],
        },
      ]);

      const response = await controller.getMemberProfileTextRecords({
        subdomain: 'ea1.aragon.eth',
      });

      assert(response.success);
      expect(response.result).toEqual([]);
    });

    it('returns a failed response when the subdomain is not under .aragon.eth', async () => {
      const controller = buildController([]);

      const response = await controller.getMemberProfileTextRecords({
        subdomain: 'vitalik.eth',
      });

      expect(response.success).toBe(false);
    });
  });
});

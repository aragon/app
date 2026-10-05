import { mapDTOToDomain } from './MemberProfileTextRecordMap';

describe('mapDTOToDomain', () => {
  it('rejects responses whose shape does not match the schema', () => {
    expect(() => mapDTOToDomain({ Domain: 'nope' })).toThrow();
    expect(() => mapDTOToDomain(null)).toThrow();
  });

  it('returns [] when the indexer has no Domain row for this name', () => {
    expect(mapDTOToDomain({ Domain: [] })).toEqual([]);
  });

  it('returns [] when the Domain exists but has no resolver yet', () => {
    expect(mapDTOToDomain({ Domain: [{ resolver: null }] })).toEqual([]);
  });

  it('maps each row in the response to a MemberProfileTextRecord', () => {
    const records = mapDTOToDomain({
      Domain: [
        {
          resolver: {
            texts: [
              { key: 'avatar', value: 'ipfs://x' },
              { key: 'url', value: 'https://aragon.org' },
            ],
          },
        },
      ],
    });

    expect(records).toHaveLength(2);
    expect(records[0].key).toBe('avatar');
    expect(records[0].value).toBe('ipfs://x');
    expect(records[1].key).toBe('url');
    expect(records[1].value).toBe('https://aragon.org');
  });

  it('propagates MemberProfileTextRecord validation errors (e.g. empty key)', () => {
    expect(() =>
      mapDTOToDomain({
        Domain: [
          {
            resolver: {
              texts: [{ key: '', value: 'x' }],
            },
          },
        ],
      }),
    ).toThrow();
  });
});

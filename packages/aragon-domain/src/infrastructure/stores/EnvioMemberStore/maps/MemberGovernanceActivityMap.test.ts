import { mapDTOToDomain } from './MemberGovernanceActivityMap';

const PLUGIN = '0x1111111111111111111111111111111111111111';
const MEMBER = '0x0123456789abcdef0123456789abcdef01234567';

const buildMetrics = (overrides: Record<string, unknown> = {}) => ({
  id: `1-${PLUGIN}-${MEMBER}`,
  chainId: 1,
  pluginAddress: PLUGIN,
  memberAddress: MEMBER,
  firstActivityTimestamp: '1650000000',
  lastActivityTimestamp: '1750000000',
  ...overrides,
});

describe('MemberGovernanceActivityMap.mapDTOToDomain', () => {
  it('throws when the response shape does not match', () => {
    expect(() => mapDTOToDomain({ MemberGovernanceMetrics: 'oops' })).toThrow();
    expect(() => mapDTOToDomain(null)).toThrow();
  });

  it('maps governance-metrics rows to domain objects', () => {
    const activity = mapDTOToDomain({
      MemberGovernanceMetrics: [buildMetrics()],
    });

    expect(activity).toHaveLength(1);
    expect(activity[0].memberAddress.toHexString().toLowerCase()).toBe(MEMBER);
    expect(activity[0].firstGovernanceActivityTimestamp).toEqual(
      new Date(1650000000 * 1000),
    );
    expect(activity[0].lastGovernanceActivityTimestamp).toEqual(
      new Date(1750000000 * 1000),
    );
  });
});

import { z } from 'zod';
import { MemberGovernanceActivity } from '@/domain/member/MemberGovernanceActivity';
import { Address, zExtended } from '@/domain/primitives';

const MemberGovernanceMetricsSchema = z.object({
  id: z.string(),
  chainId: z.number(),
  pluginAddress: zExtended.hexString(),
  memberAddress: zExtended.hexString(),
  firstActivityTimestamp: z.string(),
  lastActivityTimestamp: z.string(),
});

/**
 * Shape of the `FindMemberGovernanceMetrics` response: the governance
 * metrics rows of the page's members within the plugin.
 */
const ResponseSchema = z.object({
  MemberGovernanceMetrics: z.array(MemberGovernanceMetricsSchema),
});

export function mapDTOToDomain(raw: unknown): MemberGovernanceActivity[] {
  const data = ResponseSchema.parse(raw);

  return data.MemberGovernanceMetrics.map((metrics) =>
    MemberGovernanceActivity.create({
      memberAddress: Address.fromHexString(metrics.memberAddress),
      firstGovernanceActivityTimestamp: unixSecondsToDate(
        metrics.firstActivityTimestamp,
      ),
      lastGovernanceActivityTimestamp: unixSecondsToDate(
        metrics.lastActivityTimestamp,
      ),
    }),
  );
}

function unixSecondsToDate(seconds: string): Date {
  return new Date(Number(seconds) * 1000);
}

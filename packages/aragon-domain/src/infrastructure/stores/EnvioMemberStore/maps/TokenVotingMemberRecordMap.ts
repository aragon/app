import { z } from 'zod';
import { TokenVotingMemberRecord } from '@/domain/member/TokenVotingMemberRecord';
import { Address, zExtended } from '@/domain/primitives';
import { VotingPower } from '@/domain/voting-power/VotingPower';

const ERC20VotesDelegateSchema = z.object({
  id: z.string(),
  chainId: z.number(),
  tokenContractAddress: zExtended.hexString(),
  delegateAddress: zExtended.hexString(),
  votingPower: z.string(),
  delegationCount: z.number(),
  firstVotingPowerChangeTimestamp: z.string().nullable(),
  lastVotingPowerChangeTimestamp: z.string().nullable(),
});

const DelegateIdSchema = z.object({ id: z.string() });

/**
 * Shape of the `FindDelegates` response: the requested page of delegates
 * plus the first id-only batch of the member count.
 */
const ResponseSchema = z.object({
  ERC20VotesDelegate: z.array(ERC20VotesDelegateSchema),
  AllERC20VotesDelegate: z.array(DelegateIdSchema),
});

/**
 * Shape of the `CountDelegates` response: one further id-only batch of the
 * member count.
 */
const CountResponseSchema = z.object({
  ERC20VotesDelegate: z.array(DelegateIdSchema),
});

export interface TokenVotingMemberRecordsResult {
  records: TokenVotingMemberRecord[];

  /**
   * Size of the count batch bundled with the page; the store adds the
   * remaining batches to reach the total.
   */
  countedRecords: number;
}

export function mapDTOToDomain(raw: unknown): TokenVotingMemberRecordsResult {
  const data = ResponseSchema.parse(raw);

  const records = data.ERC20VotesDelegate.map((delegate) =>
    TokenVotingMemberRecord.create({
      address: Address.fromHexString(delegate.delegateAddress),
      votingPower: VotingPower.fromBigInt(BigInt(delegate.votingPower)),
      delegationCount: delegate.delegationCount,
      firstVotingPowerChangeTimestamp: toTimestamp(
        delegate.firstVotingPowerChangeTimestamp,
      ),
      lastVotingPowerChangeTimestamp: toTimestamp(
        delegate.lastVotingPowerChangeTimestamp,
      ),
    }),
  );

  return { records, countedRecords: data.AllERC20VotesDelegate.length };
}

/** Returns the number of ids in a `CountDelegates` batch. */
export function mapCountDTOToDomain(raw: unknown): number {
  return CountResponseSchema.parse(raw).ERC20VotesDelegate.length;
}

/** Parses a nullable unix-seconds string into a Date, preserving null. */
function toTimestamp(value: string | null): Date | null {
  return value != null ? new Date(Number(value) * 1000) : null;
}

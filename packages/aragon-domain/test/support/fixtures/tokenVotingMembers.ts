import { CHAIN_ID, PLUGIN, TOKEN } from '../constants';

/**
 * Canned Envio responses for the `getTokenVotingMembership` flow.
 *
 * The store issues two queries per page — the delegates page, then the
 * governance metrics of that page's addresses — so a non-empty scenario
 * queues a `delegatesResponse` followed by a `governanceMetricsResponse`.
 * An empty page skips the metrics query.
 */

export interface DelegateOverrides {
  /**
   * Voting power in wei, as the indexer serializes its `BigInt`.
   */
  votingPower?: string;

  /**
   * Distinct delegators currently pointing at the delegate.
   */
  delegationCount?: number;

  /**
   * Unix seconds of the first observed voting-power change.
   */
  firstVotingPowerChangeTimestamp?: string;

  /**
   * Unix seconds of the most recent voting-power change.
   */
  lastVotingPowerChangeTimestamp?: string;
}

/** A single `ERC20VotesDelegate` row as the indexer returns it. */
export function delegate(address: string, overrides: DelegateOverrides = {}) {
  return {
    id: `${CHAIN_ID}-${TOKEN}-${address}`,
    chainId: CHAIN_ID,
    tokenContractAddress: TOKEN,
    delegateAddress: address,
    votingPower: overrides.votingPower ?? '5000000000000000000',
    delegationCount: overrides.delegationCount ?? 1,
    firstVotingPowerChangeTimestamp:
      overrides.firstVotingPowerChangeTimestamp ?? '1700000000',
    lastVotingPowerChangeTimestamp:
      overrides.lastVotingPowerChangeTimestamp ?? '1700000100',
  };
}

export interface GovernanceMetricsOverrides {
  /**
   * Unix seconds of the member's first vote or proposal in the plugin.
   */
  firstActivityTimestamp?: string;

  /**
   * Unix seconds of the member's most recent vote or proposal in the plugin.
   */
  lastActivityTimestamp?: string;
}

/** A single `MemberGovernanceMetrics` row as the indexer returns it. */
export function governanceMetrics(
  address: string,
  overrides: GovernanceMetricsOverrides = {},
) {
  return {
    id: `${CHAIN_ID}-${PLUGIN}-${address}`,
    chainId: CHAIN_ID,
    pluginAddress: PLUGIN,
    memberAddress: address,
    firstActivityTimestamp: overrides.firstActivityTimestamp ?? '1650000000',
    lastActivityTimestamp: overrides.lastActivityTimestamp ?? '1750000000',
  };
}

export interface DelegatesResponseInput {
  /**
   * The delegates on the requested page.
   */
  delegates?: ReturnType<typeof delegate>[];

  /**
   * The chain-wide total used for pagination. Defaults to the number
   * of `delegates` on this page; override to simulate more pages.
   */
  totalRecords?: number;
}

/**
 * The delegates query response: the page of delegates plus the id-only
 * count batch. Totals stay below the batch size, so the store needs no
 * further count query.
 */
export function delegatesResponse({
  delegates = [],
  totalRecords,
}: DelegatesResponseInput = {}) {
  const total = totalRecords ?? delegates.length;
  return {
    ERC20VotesDelegate: delegates,
    AllERC20VotesDelegate: Array.from({ length: total }, (_, i) => ({
      id: `total-${i}`,
    })),
  };
}

/**
 * The governance metrics query response for the page's members.
 */
export function governanceMetricsResponse(
  metrics: ReturnType<typeof governanceMetrics>[] = [],
) {
  return { MemberGovernanceMetrics: metrics };
}

import type { Address, ChainId } from '@/domain/primitives';
import type { Page } from '@/domain/primitives/pagination/Page';
import type { PageRequest } from '@/domain/primitives/pagination/PageRequest';
import type { MemberGovernanceActivity } from './MemberGovernanceActivity';
import type { TokenVotingMemberRecord } from './TokenVotingMemberRecord';

export interface TokenVotingMemberData {
  /**
   * The member's on-chain delegate state for the plugin's token: voting
   * power, delegation count, and the window of voting-power changes.
   */
  record: TokenVotingMemberRecord;

  /**
   * The member's governance activity (votes cast, proposals created)
   * within the plugin, or null when none has been recorded.
   */
  activity: MemberGovernanceActivity | null;
}

export interface FindTokenVotingMembersQuery {
  /**
   * Chain the plugin and its token are deployed on.
   */
  chainId: ChainId;

  /**
   * Address of the TokenVoting plugin whose governance activity is read.
   */
  pluginAddress: Address;

  /**
   * Address of the plugin's ERC20Votes governance token whose delegates
   * form the membership.
   */
  tokenContractAddress: Address;

  /**
   * The page to return.
   */
  page: PageRequest;
}

export interface MemberStore {
  /**
   * Finds members of a TokenVoting plugin scoped to its chain and token
   * contract. Returns a page of on-chain records paired with their
   * governance activity, sorted by voting power descending.
   */
  findTokenVotingMembers(
    query: FindTokenVotingMembersQuery,
  ): Promise<Page<TokenVotingMemberData>>;
}

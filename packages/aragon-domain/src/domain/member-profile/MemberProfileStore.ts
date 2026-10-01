import type { MemberProfileAragonName } from './MemberProfileAragonName';
import type { MemberProfileTextRecord } from './MemberProfileTextRecord';

export interface MemberProfileStore {
  /**
   * Returns the current forward text records for the given subdomain.
   *
   * Returns an empty array when:
   *   - the subdomain is unknown to the indexer
   *   - the subdomain exists but has no resolver attached yet
   *   - the resolver has no text records
   */
  findTextRecordsBySubdomain(
    subdomain: MemberProfileAragonName,
  ): Promise<MemberProfileTextRecord[]>;
}

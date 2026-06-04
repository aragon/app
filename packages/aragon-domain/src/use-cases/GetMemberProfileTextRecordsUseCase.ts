import type { UseCase } from 'ddd-core-ts';
import type { MemberProfileAragonName } from '@/domain/member-profile/MemberProfileAragonName';
import type { MemberProfileStore } from '@/domain/member-profile/MemberProfileStore';
import type { MemberProfileTextRecord } from '@/domain/member-profile/MemberProfileTextRecord';

export interface GetMemberProfileTextRecordsUseCaseProps {
  subdomain: MemberProfileAragonName;
}

/**
 * Looks up the live forward ENS text records attached to a member's `.aragon.eth`
 * subdomain. Returns an empty list when the subdomain is unknown, has
 * no resolver, or has no current records.
 */
export class GetMemberProfileTextRecordsUseCase
  implements
    UseCase<GetMemberProfileTextRecordsUseCaseProps, MemberProfileTextRecord[]>
{
  public readonly code = 'GetMemberProfileTextRecordsUseCase';

  constructor(private readonly profileStore: MemberProfileStore) {}

  public async execute(
    props: GetMemberProfileTextRecordsUseCaseProps,
  ): Promise<MemberProfileTextRecord[]> {
    try {
      return await this.profileStore.findTextRecordsBySubdomain(
        props.subdomain,
      );
    } catch (cause) {
      throw new Error('Error while getting member profile text records', {
        cause,
      });
    }
  }
}

import { MemberProfileAragonName } from '@/domain/member-profile/MemberProfileAragonName';
import type { GetMemberProfileTextRecordsUseCaseProps } from '@/use-cases/GetMemberProfileTextRecordsUseCase';

export interface GetMemberProfileTextRecordsRequestDTO {
  /**
   * ENS name to look up. Must be a subdomain of `aragon.eth`.
   * Multi-segment labels are allowed.
   */
  subdomain: string;
}

export function mapDTOToDomain(
  dto: GetMemberProfileTextRecordsRequestDTO,
): GetMemberProfileTextRecordsUseCaseProps {
  return {
    subdomain: MemberProfileAragonName.fromString(dto.subdomain),
  };
}

import type { MemberProfileTextRecord } from '@/domain/member-profile/MemberProfileTextRecord';

export interface MemberProfileTextRecordDTO {
  key: string;
  value: string;
}

export function mapDomainToDTO(
  records: MemberProfileTextRecord[],
): MemberProfileTextRecordDTO[] {
  return records.map((record) => ({
    key: record.key,
    value: record.value,
  }));
}

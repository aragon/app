import type { MemberProfileAragonName } from '@/domain/member-profile/MemberProfileAragonName';
import type { MemberProfileStore } from '@/domain/member-profile/MemberProfileStore';
import type { MemberProfileTextRecord } from '@/domain/member-profile/MemberProfileTextRecord';
import type { EnvioClient } from '@/infrastructure/stores/EnvioClient';
import * as MemberProfileTextRecordMap from './maps/MemberProfileTextRecordMap';

/**
 * Looks up a Domain by name and pulls back its resolver's text rows
 * in one round-trip.
 */
const FIND_TEXT_RECORDS_QUERY = `
  query FindMemberProfileTextRecords($name: String!) {
    Domain(where: { name: { _eq: $name } }, limit: 1) {
      resolver {
        texts {
          key
          value
        }
      }
    }
  }
`;

export class EnvioMemberProfileStore implements MemberProfileStore {
  constructor(private readonly envio: EnvioClient) {}

  public async findTextRecordsBySubdomain(
    subdomain: MemberProfileAragonName,
  ): Promise<MemberProfileTextRecord[]> {
    try {
      const raw = await this.envio.query(FIND_TEXT_RECORDS_QUERY, {
        name: subdomain.toString(),
      });
      return MemberProfileTextRecordMap.mapDTOToDomain(raw);
    } catch (cause) {
      throw new Error('Error querying member profile from Envio', { cause });
    }
  }
}

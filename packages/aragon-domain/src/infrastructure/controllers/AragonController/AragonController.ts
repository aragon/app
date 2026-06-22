import type { HandlerDefinition } from 'ddd-core-ts';
import { handleRequest } from 'ddd-core-ts';
import type { MemberProfileTextRecord } from '@/domain/member-profile/MemberProfileTextRecord';
import type { EnvioClient } from '@/infrastructure/stores/EnvioClient';
import { EnvioMemberProfileStore } from '@/infrastructure/stores/EnvioMemberProfileStore/EnvioMemberProfileStore';
import type { GetMemberProfileTextRecordsUseCaseProps } from '@/use-cases/GetMemberProfileTextRecordsUseCase';
import { GetMemberProfileTextRecordsUseCase } from '@/use-cases/GetMemberProfileTextRecordsUseCase';
import type { MemberProfileTextRecordDTO } from './maps/domain/MemberProfileTextRecordMap';
import * as MemberProfileTextRecordMap from './maps/domain/MemberProfileTextRecordMap';
import type { GetMemberProfileTextRecordsRequestDTO } from './maps/use-cases/GetMemberProfileTextRecordsMap';
import * as GetMemberProfileTextRecordsMap from './maps/use-cases/GetMemberProfileTextRecordsMap';

interface HandlersRecord {
  getMemberProfileTextRecords: HandlerDefinition<
    GetMemberProfileTextRecordsRequestDTO,
    GetMemberProfileTextRecordsUseCaseProps,
    MemberProfileTextRecord[],
    MemberProfileTextRecordDTO[]
  >;
}

/**
 * General domain for all Aragon-related business logic.
 */
export class AragonController {
  private constructor(private readonly handlers: HandlersRecord) {}

  /**
   * Initializes the `AragonDomain`.
   */
  static load(envioClient: EnvioClient): AragonController {
    const memberProfileStore = new EnvioMemberProfileStore(envioClient);
    const getMemberProfileTextRecordsUseCase =
      new GetMemberProfileTextRecordsUseCase(memberProfileStore);

    const handlers: HandlersRecord = {
      getMemberProfileTextRecords: {
        requestMapper: GetMemberProfileTextRecordsMap,
        responseMapper: MemberProfileTextRecordMap,
        useCaseExecutor: getMemberProfileTextRecordsUseCase,
      },
    };

    return new AragonController(handlers);
  }

  /**
   * Looks up the live forward ENS text records attached to a member's `.aragon.eth`
   * subdomain. Returns an empty list when the subdomain is unknown, has
   * no resolver, or has no current records.
   */
  public getMemberProfileTextRecords(
    dto: GetMemberProfileTextRecordsRequestDTO,
  ) {
    return handleRequest(this.handlers.getMemberProfileTextRecords, dto);
  }
}

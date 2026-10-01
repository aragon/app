import type { HandlerDefinition } from 'ddd-core-ts';
import { handleRequest } from 'ddd-core-ts';
import type { TokenVotingMember } from '@/domain/member/TokenVotingMember';
import type { MemberProfileTextRecord } from '@/domain/member-profile/MemberProfileTextRecord';
import type { Page } from '@/domain/primitives/pagination/Page';
import type { RpcUrls } from '@/infrastructure/config/RpcUrls';
import type { EnvioClient } from '@/infrastructure/stores/EnvioClient';
import { EnvioMemberProfileStore } from '@/infrastructure/stores/EnvioMemberProfileStore/EnvioMemberProfileStore';
import { EnvioMemberStore } from '@/infrastructure/stores/EnvioMemberStore/EnvioMemberStore';
import { ViemENSStore } from '@/infrastructure/stores/ViemENSStore/ViemENSStore';
import type { GetMemberProfileTextRecordsUseCaseProps } from '@/use-cases/GetMemberProfileTextRecordsUseCase';
import { GetMemberProfileTextRecordsUseCase } from '@/use-cases/GetMemberProfileTextRecordsUseCase';
import type { GetTokenVotingMembershipUseCaseProps } from '@/use-cases/GetTokenVotingMembershipUseCase';
import { GetTokenVotingMembershipUseCase } from '@/use-cases/GetTokenVotingMembershipUseCase';
import type { MemberProfileTextRecordDTO } from './maps/domain/MemberProfileTextRecordMap';
import * as MemberProfileTextRecordMap from './maps/domain/MemberProfileTextRecordMap';
import type { PageDTO } from './maps/domain/PageMap';
import type { TokenVotingMemberDTO } from './maps/domain/TokenVotingMemberMap';
import type { GetMemberProfileTextRecordsRequestDTO } from './maps/use-cases/GetMemberProfileTextRecordsMap';
import * as GetMemberProfileTextRecordsMap from './maps/use-cases/GetMemberProfileTextRecordsMap';
import type { GetTokenVotingMembershipRequestDTO } from './maps/use-cases/GetTokenVotingMembershipMap';
import * as GetTokenVotingMembershipMap from './maps/use-cases/GetTokenVotingMembershipMap';

interface HandlersRecord {
  getTokenVotingMembership: HandlerDefinition<
    GetTokenVotingMembershipRequestDTO,
    GetTokenVotingMembershipUseCaseProps,
    Page<TokenVotingMember>,
    PageDTO<TokenVotingMemberDTO>
  >;
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
   *
   * @param envioClient Indexer client backing the on-chain member data.
   * @param rpcUrls RPC endpoint URLs keyed by chain id. The mainnet entry
   * (chain id 1) is required: it backs ENS reverse resolution, and `load`
   * throws without it rather than letting lookups fall back to viem's
   * public endpoint.
   */
  static load(envioClient: EnvioClient, rpcUrls: RpcUrls): AragonController {
    const memberStore = new EnvioMemberStore(envioClient);
    const ensStore = ViemENSStore.fromRpcUrls(rpcUrls);
    const getTokenVotingMembershipUseCase = new GetTokenVotingMembershipUseCase(
      memberStore,
      ensStore,
    );

    const memberProfileStore = new EnvioMemberProfileStore(envioClient);
    const getMemberProfileTextRecordsUseCase =
      new GetMemberProfileTextRecordsUseCase(memberProfileStore);

    const handlers: HandlersRecord = {
      getTokenVotingMembership: {
        requestMapper: GetTokenVotingMembershipMap,
        responseMapper: GetTokenVotingMembershipMap,
        useCaseExecutor: getTokenVotingMembershipUseCase,
      },
      getMemberProfileTextRecords: {
        requestMapper: GetMemberProfileTextRecordsMap,
        responseMapper: MemberProfileTextRecordMap,
        useCaseExecutor: getMemberProfileTextRecordsUseCase,
      },
    };

    return new AragonController(handlers);
  }

  /**
   * Returns a page of members of an Aragon TokenVoting plugin, scoped
   * to a specific chain and token contract and ordered by current voting
   * power descending.
   */
  public getTokenVotingMembership(dto: GetTokenVotingMembershipRequestDTO) {
    return handleRequest(this.handlers.getTokenVotingMembership, dto);
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

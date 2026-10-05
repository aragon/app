import type { TokenVotingMember } from '@/domain/member/TokenVotingMember';
import { Address, assertHexString, ChainId } from '@/domain/primitives';
import type { Page } from '@/domain/primitives/pagination/Page';
import { PageRequest } from '@/domain/primitives/pagination/PageRequest';
import type { GetTokenVotingMembershipUseCaseProps } from '@/use-cases/GetTokenVotingMembershipUseCase';
import type { PageDTO } from '../domain/PageMap';
import type { TokenVotingMemberDTO } from '../domain/TokenVotingMemberMap';
import * as TokenVotingMemberMap from '../domain/TokenVotingMemberMap';

export interface GetTokenVotingMembershipRequestDTO {
  /**
   * EIP-155 id of the chain the plugin and its token are deployed on.
   */
  chainId: number;

  /**
   * Address of the TokenVoting plugin, as 0x-prefixed hex in any casing.
   */
  pluginAddress: string;

  /**
   * Address of the plugin's ERC20Votes governance token, as 0x-prefixed
   * hex in any casing.
   */
  tokenContractAddress: string;

  /**
   * 1-based page to return. Defaults to 1.
   */
  page?: number;

  /**
   * Number of members per page, at most 250. Defaults to 20.
   */
  pageSize?: number;
}

export function mapDTOToDomain(
  dto: GetTokenVotingMembershipRequestDTO,
): GetTokenVotingMembershipUseCaseProps {
  assertHexString(
    dto.pluginAddress,
    'Expected plugin address to be a hex string',
  );
  assertHexString(
    dto.tokenContractAddress,
    'Expected token contract address to be a hex string',
  );
  return {
    chainId: ChainId.fromNumber(dto.chainId),
    pluginAddress: Address.fromHexString(dto.pluginAddress),
    tokenContractAddress: Address.fromHexString(dto.tokenContractAddress),
    page: PageRequest.create({
      page: dto.page ?? 1,
      pageSize: dto.pageSize ?? 20,
    }),
  };
}

export function mapDomainToDTO(
  result: Page<TokenVotingMember>,
): PageDTO<TokenVotingMemberDTO> {
  return {
    metadata: {
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      totalRecords: result.totalRecords,
    },
    data: result.items.map(TokenVotingMemberMap.mapDomainToDTO),
  };
}

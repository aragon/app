import type { UseCase } from 'ddd-core-ts';
import type { ENSStore } from '@/domain/ens/ENSStore';
import type { MemberStore } from '@/domain/member/MemberStore';
import { TokenVotingMember } from '@/domain/member/TokenVotingMember';
import type { Address, ChainId } from '@/domain/primitives';
import type { Page } from '@/domain/primitives/pagination/Page';
import { createPage } from '@/domain/primitives/pagination/Page';
import type { PageRequest } from '@/domain/primitives/pagination/PageRequest';

export interface GetTokenVotingMembershipUseCaseProps {
  /**
   * Chain the plugin and its token are deployed on.
   */
  chainId: ChainId;

  /**
   * Address of the TokenVoting plugin.
   */
  pluginAddress: Address;

  /**
   * Address of the plugin's ERC20Votes governance token.
   */
  tokenContractAddress: Address;

  /**
   * The page of members to return.
   */
  page: PageRequest;
}

/**
 * Returns a page of members of an Aragon TokenVoting plugin, scoped
 * to a specific chain and token contract and ordered by current voting
 * power descending.
 */
export class GetTokenVotingMembershipUseCase
  implements
    UseCase<GetTokenVotingMembershipUseCaseProps, Page<TokenVotingMember>>
{
  public readonly code = 'GetTokenVotingMembershipUseCase';

  constructor(
    private readonly memberStore: MemberStore,
    private readonly ensStore: ENSStore,
  ) {}

  public async execute(
    props: GetTokenVotingMembershipUseCaseProps,
  ): Promise<Page<TokenVotingMember>> {
    try {
      const memberPage = await this.memberStore.findTokenVotingMembers({
        chainId: props.chainId,
        pluginAddress: props.pluginAddress,
        tokenContractAddress: props.tokenContractAddress,
        page: props.page,
      });

      const namesByAddress = await this.ensStore.lookUpPrimaryNames(
        memberPage.items.map((data) => data.record.address),
      );

      const members = memberPage.items.map((data) =>
        TokenVotingMember.create(
          data.record,
          data.activity,
          // ENSStore keys its map by checksummed hex address.
          namesByAddress.get(data.record.address.toHexString()) ?? null,
        ),
      );

      return createPage(
        members,
        memberPage.page,
        memberPage.pageSize,
        memberPage.totalRecords,
      );
    } catch (cause) {
      throw new Error('Error while getting token-voting membership', {
        cause,
      });
    }
  }
}

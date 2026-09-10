import type { PageDTO, TokenVotingMemberDTO } from '@aragon/aragon-domain';
import { AragonDomainServiceClient } from '@/shared/api/aragonDomainService';
import type { IGetTokenVotingMembersParams } from './tokenVotingMembershipService.api';

class TokenVotingMembershipServiceClient extends AragonDomainServiceClient {
    private urls = {
        members: '/token-voting/members',
    };

    getTokenVotingMembership = async (
        params: IGetTokenVotingMembersParams,
    ): Promise<PageDTO<TokenVotingMemberDTO>> => {
        const result = await this.request<PageDTO<TokenVotingMemberDTO>>(
            this.urls.members,
            params,
        );

        return result;
    };
}

export const tokenVotingMembershipServiceClient =
    new TokenVotingMembershipServiceClient();

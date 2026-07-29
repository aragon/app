import 'server-only';
import type { PageDTO, TokenVotingMemberDTO } from '@aragon/aragon-domain';
import { aragonDomainServiceBackend } from '@/shared/api/aragonDomainService/aragonDomainService.backend';
import type { IGetTokenVotingMembersParams } from './tokenVotingMembershipService.api';

class TokenVotingMembershipServiceServer {
    getTokenVotingMembership = async ({
        queryParams,
    }: IGetTokenVotingMembersParams): Promise<
        PageDTO<TokenVotingMemberDTO>
    > => {
        const result =
            await aragonDomainServiceBackend.getTokenVotingMembership(
                queryParams,
            );

        if (!result.success) {
            throw new Error(
                'TokenVotingMembershipServiceServer: getTokenVotingMembership failed',
                { cause: result.error },
            );
        }

        return result.result;
    };
}

export const tokenVotingMembershipServiceServer =
    new TokenVotingMembershipServiceServer();

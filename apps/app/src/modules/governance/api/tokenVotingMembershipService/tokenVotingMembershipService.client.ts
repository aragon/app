import { HttpService } from '@/shared/api/httpService';
import type {
    IGetTokenVotingMembershipParams,
    ITokenVotingMembershipPage,
} from './tokenVotingMembershipService.api';

class TokenVotingMembershipServiceClient extends HttpService {
    constructor() {
        super('/api/governance');
    }

    private urls = {
        members: '/token-voting/members',
    };

    getTokenVotingMembership = async (
        params: IGetTokenVotingMembershipParams,
    ): Promise<ITokenVotingMembershipPage> => {
        const result = await this.request<ITokenVotingMembershipPage>(
            this.urls.members,
            params,
        );

        return result;
    };

    /**
     * Carries the source of the last page into the next request so that the
     * BFF keeps serving one list from one source, see `source` on the params.
     */
    getNextPageParams = (
        lastPage: ITokenVotingMembershipPage | null,
        _allPages: ITokenVotingMembershipPage[],
        previousParams: IGetTokenVotingMembershipParams,
    ): IGetTokenVotingMembershipParams | undefined => {
        const metadata = lastPage?.metadata;

        if (metadata == null || metadata.page >= metadata.totalPages) {
            return;
        }

        return {
            ...previousParams,
            queryParams: {
                ...previousParams.queryParams,
                page: metadata.page + 1,
                source: lastPage?.source,
            },
        };
    };
}

export const tokenVotingMembershipServiceClient =
    new TokenVotingMembershipServiceClient();

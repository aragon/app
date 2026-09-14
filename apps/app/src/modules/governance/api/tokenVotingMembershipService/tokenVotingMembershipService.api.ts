import type { GetTokenVotingMembershipRequestDTO } from '@aragon/aragon-domain';
import type { IRequestQueryParams } from '@/shared/api/httpService';

export interface IGetTokenVotingMembersParams
    extends IRequestQueryParams<GetTokenVotingMembershipRequestDTO> {}

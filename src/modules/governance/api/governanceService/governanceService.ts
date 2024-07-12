import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMember, IProposal } from './domain';
import type { IGetMemberListParams, IGetMemberParams, IGetProposalListParams } from './governanceService.api';

class GovernanceService extends AragonBackendService {
    private urls = {
        members: '/members/active',
        proposals: '/proposals',
        member: '/members/active/:address',
    };

    getMemberList = async <TMember extends IMember = IMember>(
        params: IGetMemberListParams,
    ): Promise<IPaginatedResponse<TMember>> => {
        const result = await this.request<IPaginatedResponse<TMember>>(this.urls.members, params);

        return result;
    };

    getProposalList = async <TProposal extends IProposal = IProposal>(
        params: IGetProposalListParams,
    ): Promise<IPaginatedResponse<TProposal>> => {
        const result = await this.request<IPaginatedResponse<TProposal>>(this.urls.proposals, params);

        return result;
    };

    getMember = async <TMember extends IMember = IMember>(params: IGetMemberParams): Promise<TMember> => {
        const result = await this.request<TMember>(this.urls.member, params);

        return result;
    };
}

export const governanceService = new GovernanceService();

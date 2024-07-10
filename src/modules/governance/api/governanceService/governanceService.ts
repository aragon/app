import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMember, IProposal } from './domain';
import type { IGetMemberListParams, IGetProposalListParams } from './governanceService.api';

class GovernanceService extends AragonBackendService {
    private urls = {
        members: '/members/active',
        proposals: '/proposals',
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
}

export const governanceService = new GovernanceService();

import { proposalActionsMock } from '@/modules/governance/testUtils/mocks/proposalActions';
import { AragonBackendService, type IPaginatedResponse } from '@/shared/api/aragonBackendService';
import type { IMember, IProposal } from './domain';
import type {
    IGetMemberListParams,
    IGetMemberParams,
    IGetProposalListParams,
    IGetProposalParams,
} from './governanceService.api';

class GovernanceService extends AragonBackendService {
    private urls = {
        members: '/members/active',
        member: '/members/active/:address',
        proposals: '/proposals',
        proposal: '/proposals/:id',
    };

    getMemberList = async <TMember extends IMember = IMember>(
        params: IGetMemberListParams,
    ): Promise<IPaginatedResponse<TMember>> => {
        const result = await this.request<IPaginatedResponse<TMember>>(this.urls.members, params);

        return result;
    };

    getMember = async <TMember extends IMember = IMember>(params: IGetMemberParams): Promise<TMember> => {
        const result = await this.request<TMember>(this.urls.member, params);

        return result;
    };

    getProposalList = async <TProposal extends IProposal = IProposal>(
        params: IGetProposalListParams,
    ): Promise<IPaginatedResponse<TProposal>> => {
        const result = await this.request<IPaginatedResponse<TProposal>>(this.urls.proposals, params);

        return result;
    };

    getProposal = async <TProposal extends IProposal = IProposal>(params: IGetProposalParams): Promise<TProposal> => {
        const result = await this.request<TProposal>(this.urls.proposal, params);

        //TODO: needs to be removed when the backend is ready
        result.actions = proposalActionsMock;

        return result;
    };
}

export const governanceService = new GovernanceService();

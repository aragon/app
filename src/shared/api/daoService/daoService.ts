import { IProposal, IVote } from '@/modules/governance/api/governanceService';
import { AragonBackendService, type IPaginatedResponse } from '../aragonBackendService';
import type {
    IGetDaoListByMemberAddressParams,
    IGetDaoParams,
    IGetDaoSettingsParams,
    IGetProposalListByMemberAddressParams,
    IGetVotesListByMemberAddressParams,
} from './daoService.api';
import type { IDao, IDaoSettings } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:id',
        daoSettings: '/settings/active/:daoId',
        daoListByMemberAddress: '/daos/member/:address',
        proposalListByMemberAddress: '/proposals',
        votesListByMemberAddress: '/votes',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        return result;
    };

    getDaoSettings = async <TSettings extends IDaoSettings = IDaoSettings>(
        params: IGetDaoSettingsParams,
    ): Promise<TSettings> => {
        const result = await this.request<TSettings>(this.urls.daoSettings, params);

        return result;
    };

    getDaoListByMember = async ({ urlParams }: IGetDaoListByMemberAddressParams): Promise<IPaginatedResponse<IDao>> => {
        const result = await this.request<IPaginatedResponse<IDao>>(this.urls.daoListByMemberAddress, { urlParams });

        return result;
    };

    getProposalListByMemberAddress = async ({ queryParams }: IGetProposalListByMemberAddressParams) => {
        const result = await this.request<IPaginatedResponse<IProposal>>(this.urls.proposalListByMemberAddress, {
            queryParams,
        });

        return result;
    };

    getVotesListByMemberAddress = async ({ queryParams }: IGetVotesListByMemberAddressParams) => {
        const result = await this.request<IPaginatedResponse<IVote>>(this.urls.votesListByMemberAddress, {
            queryParams,
        });

        return result;
    };
}

export const daoService = new DaoService();

import { IProposal } from '@/modules/governance/api/governanceService';
import { AragonBackendService, type IPaginatedResponse } from '../aragonBackendService';
import type { IGetDaoParams, IGetDaoSettingsParams, IGetProposalListByMemberAddressParams } from './daoService.api';
import type { IDao, IDaoSettings } from './domain';

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:id',
        daoSettings: '/settings/active/:daoId',
        proposalListByMemberAddress: '/proposals',
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

    getProposalListByMemberAddress = async <TProposal extends IProposal = IProposal>({
        queryParams,
    }: IGetProposalListByMemberAddressParams) => {
        const result = await this.request<IPaginatedResponse<TProposal>>(this.urls.proposalListByMemberAddress, {
            queryParams,
        });

        return result;
    };
}

export const daoService = new DaoService();

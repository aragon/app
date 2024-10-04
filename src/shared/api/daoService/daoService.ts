import { generateMultisigPluginSettings } from '@/plugins/multisigPlugin/testUtils/generators/multisigPluginSettings';
import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils/generators/tokenPluginSettings';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoParams } from './daoService.api';
import type { IDao } from './domain';

// TODO: Remove mocks when we have correct SPP data from backend
export const daoMock: IDao = generateDao({
    id: 'ethereum-mainnet-0xEC10f0f223e52F2d939C7372b62EF2F55173282F',
    name: 'Patito DAO',
    plugins: [
        generateDaoPlugin({
            subdomain: 'spp',
            address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
            isProcess: true,
            isBody: false,
            isSubPlugin: false,
        }),
        generateDaoPlugin({
            subdomain: 'multisig',
            parentPlugin: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
            settings: generateMultisigPluginSettings(),
            isProcess: true,
            isBody: true,
            isSubPlugin: true,
        }),
        generateDaoPlugin({
            subdomain: 'token-voting',
            address: '0xCa6f5bd946F52298a7B6154fc827bF87512a15F3',
            parentPlugin: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
            settings: generateTokenPluginSettings({
                minParticipation: 300000000,
            }),
            isProcess: true,
            isBody: true,
            isSubPlugin: true,
        }),
    ],
});

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:id',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        if (params.urlParams.id === 'ethereum-mainnet-0xEC10f0f223e52F2d939C7372b62EF2F55173282F') {
            return daoMock;
        }

        // TODO: remove when isBody, isProcess, isSubPlugin are properly returned from the backend
        return {
            ...result,
            plugins: result.plugins.map((plugin) => ({ ...plugin, isBody: true, isProcess: true, isSubPlugin: false })),
        };
    };
}

export const daoService = new DaoService();

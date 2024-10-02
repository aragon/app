import { generateMultisigPluginSettings } from '@/plugins/multisigPlugin/testUtils';
import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoParams } from './daoService.api';
import type { IDao } from './domain';

export const daoMock: IDao = generateDao({
    id: 'ethereum-mainnet-0xEC10f0f223e52F2d939C7372b62EF2F55173282F',
    name: 'Patito DAO',
    plugins: [
        generateDaoPlugin({ subdomain: 'spp', address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409' }),
        generateDaoPlugin({
            subdomain: 'multisig',
            parentPlugin: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
            settings: generateMultisigPluginSettings(),
        }),
        generateDaoPlugin({
            subdomain: 'token-voting',
            parentPlugin: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
            settings: generateTokenPluginSettings({
                minParticipation: 300000000,
            }),
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

        return result;
    };
}

export const daoService = new DaoService();

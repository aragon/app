import type { IBackendApiMock } from '@/shared/types';
import { PluginInterfaceType } from '../../../../shared/api/daoService';

// Add capital-distributor plugin to Boundless demo DAO
export const injectPluginMock: IBackendApiMock = {
    url: /\/v2\/daos\/ethereum-sepolia-0xc5dBb05Cf34Ef0Fe75cf8c7Dcc73Da471652BBE8$/,
    type: 'merge',
    data: {
        plugins: [
            {
                address: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97',
                subdomain: 'capital-distributor',
                interfaceType: PluginInterfaceType.capitalDistributor,
                release: '1',
                build: '1',
                isProcess: false,
                isBody: false,
                isSubPlugin: false,
                settings: { pluginAddress: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97' },
                blockTimestamp: 1751447066,
                transactionHash: '0x1b914b2687a155ed8e9a06dc52b7cc61fbb19b3199a8d51631c19810e4cf2da9',
                slug: 'CAP',
                links: [
                    { name: 'Boundless DAO rewards', url: 'https://boundless.com/rewards' },
                    { name: 'How to delegate', url: 'https://boundless.com/how-to/delegate' },
                ],
                name: 'Capital Distributor',
                description: 'A plugin for distributing capital',
            },
        ],
    },
};

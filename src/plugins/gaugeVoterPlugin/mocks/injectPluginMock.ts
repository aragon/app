import type { IBackendApiMock } from '@/shared/types';

// Add gauge-voter plugin to Sepolia test DAO
export const injectPluginMock: IBackendApiMock = {
    url: /\/v2\/daos\/ethereum-sepolia-0x3eb4fc049637ddb6c4C0c06f4709Ac6BC8cd829e$/,
    type: 'merge',
    data: {
        plugins: [
            {
                address: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97',
                interfaceType: 'gaugeVoter',
                subdomain: 'gauge-voter',
                release: '1',
                build: '1',
                isProcess: false,
                isBody: false,
                isSubPlugin: false,
                settings: { pluginAddress: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97' },
                blockTimestamp: 1751447066,
                transactionHash: '0x1b914b2687a155ed8e9a06dc52b7cc61fbb19b3199a8d51631c19810e4cf2da9',
                slug: 'GV',
                links: [
                    { name: 'Boundless DAO rewards', url: 'https://boundless.com/rewards' },
                    { name: 'How to delegate', url: 'https://boundless.com/how-to/delegate' },
                ],
                name: 'Gauge Voter',
                description: 'A plugin for voting on gauges',
            },
        ],
    },
};

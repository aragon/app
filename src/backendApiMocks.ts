import {
    PolicyInterfaceType,
    PolicyStrategyModelType,
    PolicyStrategySourceType,
    PolicyStrategyType,
} from './shared/api/daoService';
import type { IBackendApiMock } from './shared/types';

export const backendApiMocks: IBackendApiMock[] = [
    {
        url: /\/v2\/policies$/,
        type: 'replace',
        data: {
            data: [
                {
                    name: 'Capital Router 1 name',
                    description: 'Capital Router 1 description',
                    links: [
                        {
                            name: 'Documentation',
                            url: 'https://example.com/docs/policy',
                        },
                    ],
                    policyKey: 'CR1',
                    address: '0x1234567890123456789012345678901234567890',
                    daoAddress: '0x0987654321098765432109876543210987654321',
                    interfaceType: PolicyInterfaceType.ROUTER,
                    strategy: {
                        type: PolicyStrategyType.ROUTER,
                        model: {
                            type: PolicyStrategyModelType.RATIO,
                            address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
                            recipients: [
                                '0x1111111111111111111111111111111111111111',
                                '0x2222222222222222222222222222222222222222',
                                '0x3333333333333333333333333333333333333333',
                            ],
                            ratios: [50, 30, 20],
                        },
                        source: {
                            type: PolicyStrategySourceType.DRAIN,
                            address: '0x4444444444444444444444444444444444444444',
                            vaultAddress: '0x5555555555555555555555555555555555555555',
                            token: {
                                address: '0x6666666666666666666666666666666666666666',
                                name: 'USD Coin',
                                symbol: 'USDC',
                                decimals: 6,
                                logoURI: 'https://example.com/usdc-logo.png',
                            },
                        },
                    },
                    release: '1',
                    build: '1',
                    blockTimestamp: 1700000000,
                    transactionHash: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd',
                    metadataIpfs: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX',
                },
                {
                    name: 'Gauge-Based Routing Policy',
                    description: 'Distributes funds based on gauge voting results',
                    links: [],
                    policyKey: 'GR',
                    address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                    daoAddress: '0x0987654321098765432109876543210987654321',
                    interfaceType: PolicyInterfaceType.ROUTER,
                    strategy: {
                        type: PolicyStrategyType.ROUTER,
                        model: {
                            type: PolicyStrategyModelType.GAUGE_RATIO,
                            address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                            gaugeVoterAddress: '0xcccccccccccccccccccccccccccccccccccccccc',
                        },
                        source: {
                            type: PolicyStrategySourceType.STREAM_BALANCE,
                            address: '0xdddddddddddddddddddddddddddddddddddddddd',
                            vaultAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                            token: {
                                address: '0xffffffffffffffffffffffffffffffffffffffff',
                                name: 'Wrapped Ether',
                                symbol: 'WETH',
                                decimals: 18,
                                logoURI: 'https://example.com/weth-logo.png',
                            },
                            amountPerEpoch: BigInt('1000000000000000000'),
                            maxSourceBalance: BigInt('10000000000000000000'),
                            epochInterval: 86400,
                        },
                    },
                    release: '1',
                    build: '2',
                    blockTimestamp: 1700100000,
                    transactionHash: '0x1122334411223344112233441122334411223344112233441122334411223344',
                    metadataIpfs: 'QmYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyYyY',
                },
                {
                    name: 'Capital Distributor 1 name',
                    description: 'Capital Distributor 1 description',
                    links: [
                        {
                            name: 'Documentation',
                            url: 'https://example.com/docs/policy',
                        },
                    ],
                    policyKey: 'CD1',
                    address: '0x1234567890123456789012345678901234567890',
                    daoAddress: '0x0987654321098765432109876543210987654321',
                    interfaceType: PolicyInterfaceType.CLAIMER,
                    strategy: {
                        type: PolicyStrategyType.CLAIMER,
                        model: {
                            type: PolicyStrategyModelType.RATIO,
                            address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
                            recipients: [
                                '0x1111111111111111111111111111111111111111',
                                '0x2222222222222222222222222222222222222222',
                                '0x3333333333333333333333333333333333333333',
                            ],
                            ratios: [50, 30, 20],
                        },
                        source: {
                            type: PolicyStrategySourceType.STREAM_BALANCE,
                            address: '0x4444444444444444444444444444444444444444',
                            vaultAddress: '0x5555555555555555555555555555555555555555',
                            token: {
                                address: '0x6666666666666666666666666666666666666666',
                                name: 'USD Coin',
                                symbol: 'USDC',
                                decimals: 6,
                                logoURI: 'https://example.com/usdc-logo.png',
                            },
                            amountPerEpoch: BigInt('500000000'),
                            maxSourceBalance: BigInt('5000000000'),
                            epochInterval: 604800,
                        },
                    },
                    release: '1',
                    build: '1',
                    blockTimestamp: 1700000000,
                    transactionHash: '0xaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccddaabbccdd',
                    metadataIpfs: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX',
                },
            ],
            metadata: {
                page: 1,
                pageSize: 25,
                totalPages: 1,
                totalCount: 2,
            },
        },
    },
];

import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import { AragonBackendService } from '../aragonBackendService';
import type { IGetDaoParams } from './daoService.api';
import { Network, type IDao } from './domain';

// TODO: Remove mocks when we have correct SPP data from backend
export const daoMock: IDao = {
    address: '1234',
    network: Network.ETHEREUM_MAINNET,
    description: 'description',
    version: '1.3.0',
    subdomain: null,
    avatar: null,
    isSupported: true,
    metrics: {
        proposalsCreated: 0,
        members: 0,
        tvlUSD: '0',
    },
    links: [],
    blockTimestamp: 0,
    transactionHash: '',
    id: 'ethereum-mainnet-0xEC10f0f223e52F2d939C7372b62EF2F55173282F',
    name: 'Patito DAO',
    plugins: [
        {
            release: '0',
            build: '0',
            subdomain: 'spp',
            address: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
            isProcess: true,
            isBody: false,
            isSubPlugin: false,
            settings: {},
        },
        {
            address: '0x123',
            release: '0',
            build: '0',
            subdomain: 'multisig',
            parentPlugin: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
            settings: {
                minApprovals: 2,
                onlyListed: false,
            },
            isProcess: true,
            isBody: true,
            isSubPlugin: true,
        },
        {
            release: '0',
            build: '0',
            subdomain: 'token-voting',
            address: '0xCa6f5bd946F52298a7B6154fc827bF87512a15F3',
            parentPlugin: '0x17366cae2b9c6C3055e9e3C78936a69006BE5409',
            settings: {
                votingMode: DaoTokenVotingMode.EARLY_EXECUTION,
                supportThreshold: 0,
                minDuration: 604800,
                minParticipation: 300000000,
                minProposerVotingPower: '0',
                token: {
                    address: '0xTestAddress',
                    network: Network.ETHEREUM_MAINNET,
                    symbol: 'ETH',
                    logo: 'https://test.com',
                    name: 'Ethereum',
                    type: 'ERC-20',
                    decimals: 0,
                    priceChangeOnDayUsd: '0.00',
                    priceUsd: '2500.00',
                    totalSupply: '0',
                },
            },
            isProcess: true,
            isBody: true,
            isSubPlugin: true,
        },
    ],
};

class DaoService extends AragonBackendService {
    private urls = {
        dao: '/daos/:id',
    };

    getDao = async (params: IGetDaoParams): Promise<IDao> => {
        const result = await this.request<IDao>(this.urls.dao, params);

        // TODO: remove when we have correct SPP data from backend
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

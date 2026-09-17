/** @jest-environment node */

import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generatePluginSettings,
} from '@/shared/testUtils';
import {
    type ITokenVotingMembershipPluginSettings,
    parseMembershipQueryParams,
    resolveDomainMembershipRequest,
} from './tokenVotingMembershipService.utils';

const daoId = 'ethereum-mainnet-0x1111111111111111111111111111111111111111';
const pluginAddress = '0x2222222222222222222222222222222222222222';
const tokenAddress = '0x3333333333333333333333333333333333333333';

const generateMembershipPlugin = (
    settings?: Partial<
        Pick<ITokenVotingMembershipPluginSettings, 'token' | 'votingEscrow'>
    >,
    interfaceType = PluginInterfaceType.TOKEN_VOTING,
) =>
    generateDaoPlugin<ITokenVotingMembershipPluginSettings>({
        address: pluginAddress,
        interfaceType,
        settings: {
            ...generatePluginSettings(),
            token: { address: tokenAddress },
            ...settings,
        },
    });

describe('parseMembershipQueryParams', () => {
    const generateParams = (query: string) => new URLSearchParams(query);

    it('parses a valid request', () => {
        const result = parseMembershipQueryParams(
            generateParams(
                `daoId=${daoId}&pluginAddress=${pluginAddress}&page=2&pageSize=25&source=backend`,
            ),
        );

        expect(result).toEqual({
            daoId,
            pluginAddress,
            page: 2,
            pageSize: 25,
            source: 'backend',
        });
    });

    it.each([
        ['a missing dao id', `pluginAddress=${pluginAddress}`],
        [
            'a malformed dao id',
            `daoId=not-a-dao&pluginAddress=${pluginAddress}`,
        ],
        ['a missing plugin address', `daoId=${daoId}`],
        [
            'an invalid plugin address',
            `daoId=${daoId}&pluginAddress=not-an-address`,
        ],
        [
            'a non-integer page',
            `daoId=${daoId}&pluginAddress=${pluginAddress}&page=first`,
        ],
        [
            'a non-positive page size',
            `daoId=${daoId}&pluginAddress=${pluginAddress}&pageSize=0`,
        ],
        [
            'a page size above the maximum',
            `daoId=${daoId}&pluginAddress=${pluginAddress}&pageSize=251`,
        ],
        [
            'an unknown source',
            `daoId=${daoId}&pluginAddress=${pluginAddress}&source=envio`,
        ],
    ])('rejects %s', (_label, query) => {
        expect(
            parseMembershipQueryParams(generateParams(query)),
        ).toBeUndefined();
    });
});

describe('resolveDomainMembershipRequest', () => {
    it('builds the chain-scoped request for a plain ERC-20 token-voting plugin on an indexed network', () => {
        const result = resolveDomainMembershipRequest({
            dao: generateDao({ network: Network.ETHEREUM_MAINNET }),
            plugin: generateMembershipPlugin(),
        });

        expect(result).toEqual({
            chainId: 1,
            pluginAddress: pluginAddress.toLowerCase(),
            tokenContractAddress: tokenAddress.toLowerCase(),
        });
    });

    it.each([
        [
            'a network the domain does not index',
            {
                dao: generateDao({ network: Network.POLYGON_MAINNET }),
                plugin: generateMembershipPlugin(),
            },
        ],
        [
            'a plugin type other than token voting',
            {
                dao: generateDao({ network: Network.ETHEREUM_MAINNET }),
                plugin: generateMembershipPlugin(
                    {},
                    PluginInterfaceType.LOCK_TO_VOTE,
                ),
            },
        ],
        [
            'a wrapped governance token',
            {
                dao: generateDao({ network: Network.ETHEREUM_MAINNET }),
                plugin: generateMembershipPlugin({
                    token: { address: tokenAddress, underlying: '0xunder' },
                }),
            },
        ],
        [
            'a voting-escrow plugin',
            {
                dao: generateDao({ network: Network.ETHEREUM_MAINNET }),
                plugin: generateMembershipPlugin({
                    votingEscrow: { escrowAddress: '0xescrow' },
                }),
            },
        ],
        [
            'an unknown plugin',
            {
                dao: generateDao({ network: Network.ETHEREUM_MAINNET }),
                plugin: undefined,
            },
        ],
    ])('returns undefined for %s', (_label, params) => {
        expect(resolveDomainMembershipRequest(params)).toBeUndefined();
    });
});

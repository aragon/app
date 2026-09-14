import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generatePluginSettings,
} from '@/shared/testUtils';
import {
    buildTokenVotingMembershipParams,
    type ITokenVotingMembershipPluginSettings,
    isTokenMemberListPlugin,
} from './buildTokenVotingMembershipParams';

describe('buildTokenVotingMembershipParams', () => {
    const initialParams = {
        queryParams: {
            daoId: 'dao-id',
            pluginAddress: '0xPlugin',
            pageSize: 18,
        },
    };

    const generateMembershipPlugin = (
        interfaceType: PluginInterfaceType,
        token: ITokenVotingMembershipPluginSettings['token'],
    ) =>
        generateDaoPlugin<ITokenVotingMembershipPluginSettings>({
            interfaceType,
            settings: { ...generatePluginSettings(), token },
        });

    it('builds the routing params from the plugin settings and DAO network', () => {
        const plugin = generateMembershipPlugin(
            PluginInterfaceType.TOKEN_VOTING,
            { address: '0xToken', underlying: '0xUnderlying' },
        );
        const dao = generateDao({ network: Network.ETHEREUM_MAINNET });

        const result = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            dao,
        );

        expect(result.queryParams).toEqual({
            daoId: 'dao-id',
            pluginAddress: '0xPlugin',
            pageSize: 18,
            network: Network.ETHEREUM_MAINNET,
            pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
            tokenAddress: '0xToken',
            tokenUnderlying: '0xUnderlying',
        });
    });

    it('normalizes a missing underlying to null (lock-to-vote tokens do not carry the field)', () => {
        const plugin = generateMembershipPlugin(
            PluginInterfaceType.LOCK_TO_VOTE,
            { address: '0xToken' },
        );
        const dao = generateDao({ network: Network.POLYGON_MAINNET });

        const { queryParams } = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            dao,
        );

        expect(queryParams.tokenAddress).toBe('0xToken');
        expect(queryParams.tokenUnderlying).toBeNull();
        expect(queryParams.pluginInterfaceType).toBe(
            PluginInterfaceType.LOCK_TO_VOTE,
        );
    });

    it('preserves the original daoId for non-linked-account plugins', () => {
        const plugin = generateMembershipPlugin(
            PluginInterfaceType.TOKEN_VOTING,
            { address: '0xToken' },
        );

        const { queryParams } = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            generateDao(),
        );

        expect(queryParams.daoId).toBe('dao-id');
    });
});

describe('isTokenMemberListPlugin', () => {
    it.each([
        [PluginInterfaceType.TOKEN_VOTING, true],
        [PluginInterfaceType.LOCK_TO_VOTE, true],
        [PluginInterfaceType.MULTISIG, false],
        [PluginInterfaceType.ADMIN, false],
    ])('returns %s → %s', (interfaceType, expected) => {
        const plugin = generateDaoPlugin({ interfaceType });
        expect(isTokenMemberListPlugin(plugin)).toBe(expected);
    });
});

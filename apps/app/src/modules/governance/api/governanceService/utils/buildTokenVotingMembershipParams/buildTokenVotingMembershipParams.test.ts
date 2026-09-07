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

    const options = { domainSourceEnabled: true };

    const generateMembershipPlugin = (
        interfaceType: PluginInterfaceType,
        settings: Partial<
            Pick<ITokenVotingMembershipPluginSettings, 'token' | 'votingEscrow'>
        >,
    ) =>
        generateDaoPlugin<ITokenVotingMembershipPluginSettings>({
            interfaceType,
            settings: {
                ...generatePluginSettings(),
                token: { address: '0xToken' },
                ...settings,
            },
        });

    it('builds the routing params from the plugin settings, DAO network and options', () => {
        const plugin = generateMembershipPlugin(
            PluginInterfaceType.TOKEN_VOTING,
            { token: { address: '0xToken', underlying: '0xUnderlying' } },
        );
        const dao = generateDao({ network: Network.ETHEREUM_MAINNET });

        const result = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            dao,
            options,
        );

        expect(result.queryParams).toEqual({
            daoId: 'dao-id',
            pluginAddress: '0xPlugin',
            pageSize: 18,
            network: Network.ETHEREUM_MAINNET,
            pluginInterfaceType: PluginInterfaceType.TOKEN_VOTING,
            tokenAddress: '0xToken',
            tokenUnderlying: '0xUnderlying',
            hasVotingEscrow: false,
            domainSourceEnabled: true,
        });
    });

    it('flags voting-escrow backed plugins', () => {
        const plugin = generateMembershipPlugin(
            PluginInterfaceType.TOKEN_VOTING,
            { votingEscrow: { escrowAddress: '0xEscrow' } },
        );

        const { queryParams } = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            generateDao(),
            options,
        );

        expect(queryParams.hasVotingEscrow).toBe(true);
    });

    it('forwards a disabled domain source', () => {
        const plugin = generateMembershipPlugin(
            PluginInterfaceType.TOKEN_VOTING,
            {},
        );

        const { queryParams } = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            generateDao(),
            { domainSourceEnabled: false },
        );

        expect(queryParams.domainSourceEnabled).toBe(false);
    });

    it('normalizes a missing underlying to null (lock-to-vote tokens do not carry the field)', () => {
        const plugin = generateMembershipPlugin(
            PluginInterfaceType.LOCK_TO_VOTE,
            {},
        );
        const dao = generateDao({ network: Network.POLYGON_MAINNET });

        const { queryParams } = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            dao,
            options,
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
            {},
        );

        const { queryParams } = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            generateDao(),
            options,
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

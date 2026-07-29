import {
    type IPluginSettings,
    Network,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { buildTokenVotingMembershipParams } from './buildTokenVotingMembershipParams';

describe('buildTokenVotingMembershipParams', () => {
    const initialParams = {
        queryParams: {
            daoId: 'dao-id',
            pluginAddress: '0xPlugin',
            pageSize: 18,
        },
    };

    it('builds the routing params from the plugin settings and DAO network', () => {
        const settings = {
            token: { address: '0xToken', underlying: '0xUnderlying' },
        } as unknown as IPluginSettings;
        const plugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            settings,
        });
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

    it('defaults tokenUnderlying to null and tokenAddress to undefined when the settings carry no token', () => {
        const plugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
        });
        const dao = generateDao({ network: Network.POLYGON_MAINNET });

        const { queryParams } = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            dao,
        );

        expect(queryParams.tokenAddress).toBeUndefined();
        expect(queryParams.tokenUnderlying).toBeNull();
        expect(queryParams.pluginInterfaceType).toBe(
            PluginInterfaceType.LOCK_TO_VOTE,
        );
    });

    it('preserves the original daoId for non-linked-account plugins', () => {
        const plugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
        });

        const { queryParams } = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            generateDao(),
        );

        expect(queryParams.daoId).toBe('dao-id');
    });
});

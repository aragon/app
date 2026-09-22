import { Network, PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import {
    buildTokenVotingMembershipParams,
    isTokenMemberListPlugin,
} from './buildTokenVotingMembershipParams';

describe('buildTokenVotingMembershipParams', () => {
    const initialParams = {
        queryParams: {
            daoId: 'ethereum-mainnet-0xdao',
            pluginAddress: '0xPlugin',
            pageSize: 18,
        },
    };

    it('builds the params the BFF needs and nothing else', () => {
        const plugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
        });
        const dao = generateDao({ network: Network.ETHEREUM_MAINNET });

        const result = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            dao,
        );

        expect(result.queryParams).toEqual({
            daoId: 'ethereum-mainnet-0xdao',
            pluginAddress: '0xPlugin',
            page: undefined,
            pageSize: 18,
        });
    });

    it('targets the linked account own DAO for linked-account plugins', () => {
        const plugin = generateDaoPlugin({
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
        });
        const dao = generateDao();
        const resolvePluginDaoIdSpy = jest
            .spyOn(daoUtils, 'resolvePluginDaoId')
            .mockReturnValue('ethereum-mainnet-0xlinked');

        const { queryParams } = buildTokenVotingMembershipParams(
            initialParams,
            plugin,
            dao,
        );

        expect(resolvePluginDaoIdSpy).toHaveBeenCalledWith(
            initialParams.queryParams.daoId,
            plugin,
            dao,
        );
        expect(queryParams.daoId).toBe('ethereum-mainnet-0xlinked');

        resolvePluginDaoIdSpy.mockRestore();
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

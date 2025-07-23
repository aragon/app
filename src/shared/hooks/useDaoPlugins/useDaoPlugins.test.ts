import * as daoService from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { PluginType } from '@/shared/types';
import { daoUtils } from '@/shared/utils/daoUtils';
import { renderHook } from '@testing-library/react';
import { useDaoPlugins } from './useDaoPlugins';

describe('useDaoPlugins hook', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const getDaoPluginsSpy = jest.spyOn(daoUtils, 'getDaoPlugins');

    afterEach(() => {
        useDaoSpy.mockReset();
        getDaoPluginsSpy.mockReset();
    });

    it('retrieves the DAO plugins and returns them as tab-plugins', () => {
        const plugins = [
            generateDaoPlugin({
                interfaceType: PluginInterfaceType.MULTISIG,
                subdomain: 'multisig',
                address: '0x123',
                slug: 'multi',
            }),
            generateDaoPlugin({
                interfaceType: PluginInterfaceType.TOKEN_VOTING,
                subdomain: 'token-voting',
                address: '0x456',
                slug: 'token',
            }),
        ];
        const dao = generateDao({ id: 'test', plugins });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        getDaoPluginsSpy.mockReturnValue(plugins);
        const { result } = renderHook(() => useDaoPlugins({ daoId: dao.id }));

        expect(result.current).toEqual([
            { id: 'multisig', uniqueId: plugins[0].slug, label: 'Multisig', meta: plugins[0], props: {} },
            { id: 'tokenVoting', uniqueId: plugins[1].slug, label: 'Token Voting', meta: plugins[1], props: {} },
        ]);
    });

    it('filters the plugins by the type or address when specified', () => {
        const type = PluginType.BODY;
        const pluginAddress = '0x572983';
        const dao = generateDao({
            plugins: [generateDaoPlugin({ interfaceType: PluginInterfaceType.SPP, address: '0x123' })],
        });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        renderHook(() => useDaoPlugins({ daoId: dao.id, type, pluginAddress }));
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, { type, pluginAddress });
    });

    it('filters the plugins by those with full execute when hasExecute is true', () => {
        const hasExecute = true;
        const dao = generateDao({
            plugins: [generateDaoPlugin({ interfaceType: PluginInterfaceType.MULTISIG, conditionAddress: '0x123' })],
        });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        renderHook(() => useDaoPlugins({ daoId: dao.id, hasExecute }));
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, { hasExecute });
    });
});

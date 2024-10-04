import * as daoService from '@/shared/api/daoService';
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
            generateDaoPlugin({ subdomain: 'multisig', address: '0x123' }),
            generateDaoPlugin({ subdomain: 'token-voting', address: '0x456' }),
        ];
        const dao = generateDao({ id: 'test', plugins });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        getDaoPluginsSpy.mockReturnValue(plugins);
        const { result } = renderHook(() => useDaoPlugins({ daoId: dao.id }));

        expect(result.current).toEqual([
            { id: 'multisig', uniqueId: 'multisig-0x123', label: 'Multisig', meta: plugins[0], props: {} },
            { id: 'token-voting', uniqueId: 'token-voting-0x456', label: 'Token Voting', meta: plugins[1], props: {} },
        ]);
    });

    it('filters the plugins by the type or address when specified', () => {
        const type = PluginType.BODY;
        const pluginAddress = '0x572983';
        const dao = generateDao({ plugins: [generateDaoPlugin({ subdomain: 'spp', address: '0x123' })] });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));

        renderHook(() => useDaoPlugins({ daoId: dao.id, type, pluginAddress }));
        expect(getDaoPluginsSpy).toHaveBeenCalledWith(dao, { type, pluginAddress, includeSubPlugins: false });
    });
});

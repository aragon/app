import * as daoService from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin, generatePlugin, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { renderHook } from '@testing-library/react';
import { useSupportedDaoPlugin } from './useSupportedDaoPlugin';

describe('useSupportedDaoPlugin', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const getPluginSpy = jest.spyOn(pluginRegistryUtils, 'getPlugin');

    afterEach(() => {
        useDaoSpy.mockReset();
        getPluginSpy.mockReset();
    });

    it('fetches the DAO using the given ID and returns the first supported DAO plugin', () => {
        const daoId = 'dao-id';
        const registeredPlugin = generateDaoPlugin({ subdomain: 'multisig' });
        const daoPlugins = [generateDaoPlugin({ subdomain: 'unknown' }), registeredPlugin];
        const dao = generateDao({ id: daoId, plugins: daoPlugins });
        getPluginSpy.mockReturnValueOnce(undefined).mockReturnValueOnce(generatePlugin());
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        const { result } = renderHook(() => useSupportedDaoPlugin(daoId));
        expect(result.current).toEqual(registeredPlugin);
    });

    it('returns undefined when DAO has no supported plugins', () => {
        const daoId = 'dao-id';
        const daoPlugins = [generateDaoPlugin({ subdomain: 'unknown' }), generateDaoPlugin({ subdomain: '???' })];
        const dao = generateDao({ id: daoId, plugins: daoPlugins });
        getPluginSpy.mockReturnValueOnce(undefined).mockReturnValueOnce(undefined);
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        const { result } = renderHook(() => useSupportedDaoPlugin(daoId));
        expect(result.current).toBeUndefined();
    });
});

import { renderHook } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import type { IUseDaoChainReturn } from '../useDaoChain';
import * as useDaoChainHook from '../useDaoChain';
import * as useDaoPluginsHook from '../useDaoPlugins';
import { useDaoPluginInfo } from './useDaoPluginInfo';

describe('useDaoPluginInfo', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPluginsHook, 'useDaoPlugins');
    const useDaoChainSpy = jest.spyOn(useDaoChainHook, 'useDaoChain');

    const safeAddress = '0x1234567890123456789012345678901234567890';
    const daoId = 'ethereum-mainnet-0xdao';

    beforeEach(() => {
        const safePlugin = generateDaoPlugin({
            address: safeAddress,
            build: null as unknown as string,
            interfaceType: daoService.PluginInterfaceType.SAFE,
            release: null as unknown as string,
        });

        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateDao({ id: daoId, plugins: [safePlugin] }),
            }),
        );
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({ meta: safePlugin }),
        ]);
        useDaoChainSpy.mockReturnValue({
            buildEntityUrl: ({ id }: { id?: string }) =>
                id != null ? `https://explorer.test/${id}` : undefined,
        } as unknown as IUseDaoChainReturn);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        useDaoChainSpy.mockReset();
    });

    it('does not format Safe metadata as an OSx version when release/build are absent', () => {
        const { result } = renderHook(() =>
            useDaoPluginInfo({ daoId, address: safeAddress }),
        );

        expect(result.current[0].description).toBe('Safe 0x1234…7890');
    });
});

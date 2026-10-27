import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { renderHook } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import type { IUseDaoChainReturn } from '../useDaoChain';
import * as useDaoChainHook from '../useDaoChain';
import { useDaoPluginInfo } from './useDaoPluginInfo';

describe('useDaoPluginInfo', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');
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

    it.each(['token-voting', undefined])(
        'describes a custom-named plugin by its contract and version with subdomain %s',
        (subdomain) => {
            const plugin = generateDaoPlugin({
                name: 'TV',
                subdomain,
                interfaceType: PluginInterfaceType.TOKEN_VOTING,
                release: '1',
                build: '4',
            });
            const dao = generateDao({ plugins: [plugin] });
            useDaoSpy.mockReturnValue(
                generateReactQueryResultSuccess({ data: dao }),
            );
            useDaoPluginsSpy.mockReturnValue([
                generateFilterComponentPlugin({ meta: plugin }),
            ]);

            const { result } = renderHook(
                () =>
                    useDaoPluginInfo({
                        daoId: dao.id,
                        address: plugin.address,
                    }),
                { wrapper: GukModulesProvider },
            );

            expect(result.current[0]).toMatchObject({
                definition: plugin.address,
                description:
                    'app.shared.daoPluginInfo.pluginVersionInfo (name=Token Voting,release=1,build=4)',
            });
        },
    );
});

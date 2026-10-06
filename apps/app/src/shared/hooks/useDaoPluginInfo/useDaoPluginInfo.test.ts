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
import { useDaoPluginInfo } from './useDaoPluginInfo';

describe('useDaoPluginInfo hook', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
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

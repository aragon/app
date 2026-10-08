import { Dialog, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as daoService from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDao,
    generateDaoPlugin,
    generateDialogContext,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { UpdateDaoContractsListDialog } from './updateDaoContractsListDialog';

describe('<UpdateDaoContractsListDialog /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const getPluginsSpy = jest.spyOn(pluginRegistryUtils, 'getPlugins');
    const getPluginSpy = jest.spyOn(pluginRegistryUtils, 'getPlugin');

    afterEach(() => {
        useDaoSpy.mockReset();
        useDialogContextSpy.mockReset();
        getPluginsSpy.mockReset();
        getPluginSpy.mockReset();
    });

    it('keeps the custom heading and uses the contract name for both versions', () => {
        const plugin = generateDaoPlugin({
            name: 'Test',
            interfaceType: PluginInterfaceType.TOKEN_VOTING,
            subdomain: 'token-voting',
            release: '1',
            build: '1',
        });
        const dao = generateDao({ plugins: [plugin] });
        const pluginInfo = {
            id: PluginInterfaceType.TOKEN_VOTING,
            name: 'Token',
            subdomain: 'token-voting',
            installVersion: {
                release: 1,
                build: 3,
                releaseNotes: 'https://example.com/releases',
                description: '',
            },
        };
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: dao }),
        );
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        getPluginsSpy.mockReturnValue([pluginInfo]);
        getPluginSpy.mockReturnValue(pluginInfo);

        render(
            <GukModulesProvider>
                <Dialog.Root open={true}>
                    <UpdateDaoContractsListDialog
                        location={{
                            id: 'upgrade',
                            params: { daoId: dao.id, plugin },
                        }}
                    />
                </Dialog.Root>
            </GukModulesProvider>,
        );

        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.settings.updateDaoContractsCard.versionUpdate (from=Token Voting v1.1,to=Token Voting v1.3)',
            ),
        ).toBeInTheDocument();
    });
});

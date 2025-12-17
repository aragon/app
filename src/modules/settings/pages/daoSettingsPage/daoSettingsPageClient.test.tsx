import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as DaoService from '@/shared/api/daoService';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { DialogProvider } from '@/shared/components/dialogProvider';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import * as UseDaoPluginsModule from '@/shared/hooks/useDaoPlugins';
import {
    generateDao,
    generateDaoPlugin,
    generateFilterComponentPlugin,
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { DaoSettingsPageClient, type IDaoSettingsPageClientProps } from './daoSettingsPageClient';

jest.mock('@/modules/settings/components/updateDaoContracts', () => ({
    UpdateDaoContracts: () => <div data-testid="update-dao-contracts" />,
}));
jest.mock('@/plugins/adminPlugin/components/adminSettingsPanel', () => ({
    AdminSettingsPanel: () => <div data-testid="admin-settings-mock" />,
}));

describe('<DaoSettingsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const hasSupportedPluginsSpy = jest.spyOn(daoUtils, 'hasSupportedPlugins');
    const useDaoPluginsSpy = jest.spyOn(UseDaoPluginsModule, 'useDaoPlugins');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([
            generateFilterComponentPlugin({
                id: 'one',
                uniqueId: '1',
                label: 'one',
                meta: generateDaoPlugin({
                    interfaceType: PluginInterfaceType.MULTISIG,
                    address: '0x123',
                }),
            }),
        ]);
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginsSpy.mockReset();
        hasSupportedPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoSettingsPageClientProps>) => {
        const completeProps: IDaoSettingsPageClientProps = {
            daoId: 'test',
            ...props,
        };

        return (
            <GukModulesProvider>
                <FeatureFlagsProvider>
                    <DialogProvider>
                        <DaoSettingsPageClient {...completeProps} />
                    </DialogProvider>
                </FeatureFlagsProvider>
            </GukModulesProvider>
        );
    };

    it('renders the page title', () => {
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsPage.main.title/)).toBeInTheDocument();
    });

    it('renders the dao settings, info and contract update components', () => {
        const dao = generateDao({ id: 'my-dao', name: 'My Dao Name' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsPage.main.settingsInfoTitle/)).toBeInTheDocument();
        expect(screen.getByText(/daoSettingsPage.aside.versionInfoTitle/)).toBeInTheDocument();
        expect(screen.getByText('My Dao Name')).toBeInTheDocument();
        expect(screen.getByText(/daoVersionInfo.osValue/)).toBeInTheDocument();
        expect(screen.getByTestId('update-dao-contracts')).toBeInTheDocument();
    });

    it('renders the governance processes of the DAO', () => {
        const plugins = [
            generateFilterComponentPlugin({
                uniqueId: '1',
                meta: generateDaoPlugin({ description: 'one' }),
            }),
            generateFilterComponentPlugin({
                uniqueId: '2',
                meta: generateDaoPlugin({ description: 'two' }),
            }),
        ];
        hasSupportedPluginsSpy.mockReturnValue(true);
        useDaoPluginsSpy.mockReturnValue(plugins);
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsPage.main.governanceInfoTitle/)).toBeInTheDocument();
        expect(screen.getByText(plugins[0].meta.description!)).toBeInTheDocument();
        expect(screen.getByText(plugins[1].meta.description!)).toBeInTheDocument();
    });

    it('does not render governance processes section when dao has no supported plugins', () => {
        hasSupportedPluginsSpy.mockReturnValue(false);
        render(createTestComponent());
        expect(screen.queryByText(/daoSettingsPage.main.governanceInfoTitle/)).not.toBeInTheDocument();
    });

    it('returns null when DAO cannot be fetched', () => {
        useDaoSpy.mockReturnValue(generateReactQueryResultError({ error: new Error('dao fetch error') }));
        render(createTestComponent());
        expect(screen.queryByText(/daoSettingsPage.main.title/)).not.toBeInTheDocument();
    });
});

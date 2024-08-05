import * as DaoService from '@/shared/api/daoService';
import * as useDaoPluginIds from '@/shared/hooks/useDaoPluginIds';
import * as useSlotFunction from '@/shared/hooks/useSlotFunction';
import { generateDao, generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { SettingsSlotId } from '../../constants/moduleSlots';
import { DaoSettingsPageClient, type IDaoSettingsPageClientProps } from './daoSettingsPageClient';

jest.mock('@/shared/components/pluginComponent', () => ({
    PluginComponent: (props: { slotId: string; pluginIds: string[] }) => (
        <div data-testid="plugin-component-mock" data-slotid={props.slotId} data-pluginids={props.pluginIds} />
    ),
}));

jest.mock('@/shared/utils/pluginRegistryUtils', () => ({
    getPlugin: jest.fn(),
}));

describe('<DaoSettingsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const useDaoPluginIdsSpy = jest.spyOn(useDaoPluginIds, 'useDaoPluginIds');
    const useSlotFunctionSpy = jest.spyOn(useSlotFunction, 'useSlotFunction');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useDaoPluginIdsSpy.mockReturnValue([]);
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useDaoPluginIdsSpy.mockReset();
        useSlotFunctionSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IDaoSettingsPageClientProps>) => {
        const completeProps: IDaoSettingsPageClientProps = {
            daoId: 'test',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <DaoSettingsPageClient {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('renders the page title', () => {
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsPage.main.title/)).toBeInTheDocument();
    });

    it('renders the DaoSettingsInfo and DaoVersionInfo components', () => {
        const dao = generateDao({ id: 'my-dao', name: 'My Dao Name' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsPage.main.settingsInfoTitle/)).toBeInTheDocument();
        expect(screen.getByText(/daoSettingsPage.aside.versionInfoTitle/)).toBeInTheDocument();
        expect(screen.getByText('My Dao Name')).toBeInTheDocument();
        expect(screen.getByText(/daoVersionInfo.osValue/)).toBeInTheDocument();
    });

    it('renders the dao governance info component', () => {
        useSlotFunctionSpy.mockReturnValue([
            { term: 'Governance Term 1', definition: 'Definition 1' },
            { term: 'Governance Term 2', definition: 'Definition 2' },
        ]);
        render(createTestComponent());
        expect(screen.getByText('Governance Term 1')).toBeInTheDocument();
        expect(screen.getByText('Definition 1')).toBeInTheDocument();
        expect(screen.getByText('Governance Term 2')).toBeInTheDocument();
        expect(screen.getByText('Definition 2')).toBeInTheDocument();
    });

    it('renders the dao members info component', () => {
        const pluginIds = ['multisig'];
        useDaoPluginIdsSpy.mockReturnValue(pluginIds);
        const dao = generateDao({ id: 'my-dao', name: 'My Dao Name' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        const pluginComponent = screen.getByTestId('plugin-component-mock');
        expect(pluginComponent).toBeInTheDocument();
        expect(pluginComponent.dataset.slotid).toEqual(SettingsSlotId.SETTINGS_MEMBERS_INFO);
        expect(pluginComponent.dataset.pluginids).toEqual(pluginIds.toString());
    });

    it('returns null when DAO cannot be fetched', () => {
        useDaoSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        render(createTestComponent());
        expect(screen.queryByText(/daoSettingsPage.main.title/)).not.toBeInTheDocument();
    });
});

import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

jest.mock('@/shared/utils/pluginRegistryUtils', () => ({
    getPlugin: jest.fn(),
}));

describe('<DaoSettingsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props: { daoId: string } = { daoId: 'test-dao' }) => {
        const { daoId } = props;
        return (
            <OdsModulesProvider>
                <DaoSettingsPageClient daoId={daoId} />
            </OdsModulesProvider>
        );
    };

    it('renders the page title', () => {
        const dao = generateDao({ id: 'my-dao', name: 'My Dao' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsPage.main.title/)).toBeInTheDocument();
    });

    it('renders the DaoSettingsInfo and DaoVersionInfo components', () => {
        const dao = generateDao({ id: 'my-dao', name: 'My Dao Name' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsPage.main.daoSettingsInfo.title/)).toBeInTheDocument();
        expect(screen.getByText(/daoSettingsPage.aside.daoVersionInfo.title/)).toBeInTheDocument();
        expect(screen.getByText('My Dao Name')).toBeInTheDocument();
        expect(screen.getByText(/daoSettingsPage.aside.daoVersionInfo.osValue \(os=Aragon OSx\)/)).toBeInTheDocument();
    });
});

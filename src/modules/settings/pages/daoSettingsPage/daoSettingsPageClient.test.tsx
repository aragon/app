import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoSettingsPageClient, type IDaoSettingsPageClientProps } from './daoSettingsPageClient';

describe('<DaoSettingsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
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
        const dao = generateDao({ id: 'my-dao', name: 'My Dao' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
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

    it('returns null when DAO cannot be fetched', () => {
        useDaoSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        render(createTestComponent());
        expect(screen.queryByText(/daoSettingsPage.main.title/)).not.toBeInTheDocument();
    });
});

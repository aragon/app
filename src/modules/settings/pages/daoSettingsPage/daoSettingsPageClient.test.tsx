import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DaoSettingsPageClient, type IDaoSettingsPageClientProps } from './daoSettingsPageClient';

jest.mock('@/modules/settings/components/daoGovernanceInfo', () => ({
    DaoGovernanceInfo: () => <div data-testid="governance-info-mock" />,
}));
jest.mock('@/modules/settings/components/daoMembersInfo', () => ({
    DaoMembersInfo: () => <div data-testid="members-info-mock" />,
}));

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
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsPage.main.governanceInfoTitle/)).toBeInTheDocument();
        expect(screen.getByTestId('governance-info-mock')).toBeInTheDocument();
    });

    it('renders the dao members info component', () => {
        render(createTestComponent());
        expect(screen.getByText(/daoSettingsPage.main.membersInfoTitle/)).toBeInTheDocument();
        expect(screen.getByTestId('members-info-mock')).toBeInTheDocument();
    });

    it('returns null when DAO cannot be fetched', () => {
        useDaoSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        render(createTestComponent());
        expect(screen.queryByText(/daoSettingsPage.main.title/)).not.toBeInTheDocument();
    });
});

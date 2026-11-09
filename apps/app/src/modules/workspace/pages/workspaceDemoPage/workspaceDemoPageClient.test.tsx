import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import { WorkspaceDemoPageClient } from './workspaceDemoPageClient';

const workspaceStorageKey = 'aragon-workspaces';

describe('<WorkspaceDemoPageClient /> component', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

    beforeEach(() => {
        usePathnameSpy.mockReturnValue('/demo');
        localStorage.setItem(
            workspaceStorageKey,
            '{"existing":{"id":"existing"}}',
        );
    });

    afterEach(() => {
        usePathnameSpy.mockReset();
        localStorage.clear();
    });

    it('renders the static account fixture without linking or persisting it', () => {
        const storedWorkspaces = localStorage.getItem(workspaceStorageKey);

        render(
            <FeatureFlagsProvider>
                <GukModulesProvider>
                    <WorkspaceDemoPageClient />
                </GukModulesProvider>
            </FeatureFlagsProvider>,
        );

        expect(
            screen.getByRole('heading', {
                level: 1,
                name: 'app.workspace.demo.name',
            }),
        ).toBeInTheDocument();
        expect(screen.getAllByText('Citrea DAO')).not.toHaveLength(0);
        expect(screen.getByText('Citrea Ops Safe')).toBeInTheDocument();
        expect(screen.getByText('Citrea Grants Safe')).toBeInTheDocument();
        expect(
            screen.getByTitle('0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419'),
        ).toBeInTheDocument();
        expect(
            screen.getByTitle('0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419'),
        ).toHaveTextContent(/^Citrea · /);
        expect(screen.getByText(/owners=5,threshold=3/)).toBeInTheDocument();
        expect(screen.getByText(/owners=3,threshold=2/)).toBeInTheDocument();

        const accounts = screen.getByRole('region', {
            name: 'app.workspace.demo.section.accounts',
        });
        expect(within(accounts).queryByRole('link')).not.toBeInTheDocument();
        expect(localStorage.getItem(workspaceStorageKey)).toBe(
            storedWorkspaces,
        );
    });

    it('keeps landing, read-only state, and navigation reachable below lg', async () => {
        const user = userEvent.setup();

        render(
            <FeatureFlagsProvider>
                <GukModulesProvider>
                    <WorkspaceDemoPageClient />
                </GukModulesProvider>
            </FeatureFlagsProvider>,
        );

        expect(
            screen.getAllByRole('link', {
                name: 'app.workspace.demo.navigation.landing',
            }),
        ).toHaveLength(2);
        expect(
            screen.getAllByText('app.workspace.demo.readOnly'),
        ).not.toHaveLength(0);

        await user.click(
            screen.getByRole('button', {
                name: 'app.workspace.demo.navigation.open',
            }),
        );

        expect(
            screen.getByRole('dialog', {
                name: 'app.workspace.demo.navigation.dialog.title',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', {
                name: 'app.application.navigationDao.dialog.explore',
            }),
        ).toHaveAttribute('href', '/');
    });
});

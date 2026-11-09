import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import { FeatureFlagsProvider } from '@/shared/components/featureFlagsProvider';
import type { FeatureFlagSnapshot } from '@/shared/featureFlags';
import { WorkspaceDemoPageClient } from './workspaceDemoPageClient';

const workspaceStorageKey = 'aragon-workspaces';
const workspacesSnapshot: FeatureFlagSnapshot[] = [
    {
        key: 'workspaces',
        name: 'Workspaces',
        description: '',
        enabled: true,
    },
];

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

    it('renders navigable Aragon account fixtures without persisting them', () => {
        const storedWorkspaces = localStorage.getItem(workspaceStorageKey);

        render(
            <FeatureFlagsProvider initialSnapshot={workspacesSnapshot}>
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
        expect(screen.getAllByText('Aragon X (Mainnet)')).not.toHaveLength(0);
        expect(screen.getByText('Aragon Operations Safe')).toBeInTheDocument();
        expect(screen.getByText('Aragon Grants Safe')).toBeInTheDocument();
        expect(
            screen.getByTitle('0x9c25a6b1bf3F6Fd2F68a62169c043045C2460482'),
        ).toHaveTextContent(/^Ethereum · /);
        expect(screen.getByText(/owners=4,threshold=3/)).toBeInTheDocument();
        expect(screen.getByText(/owners=3,threshold=2/)).toBeInTheDocument();

        const accounts = screen.getByRole('region', {
            name: 'app.workspace.demo.section.accounts',
        });
        expect(
            within(accounts).getByRole('link', { name: /Aragon X/ }),
        ).toHaveAttribute('href', '/demo/account/aragon-x/dashboard');
        expect(
            within(accounts).getByRole('link', {
                name: /Aragon Operations Safe/,
            }),
        ).toHaveAttribute('href', '/demo/account/operations-safe/dashboard');
        expect(localStorage.getItem(workspaceStorageKey)).toBe(
            storedWorkspaces,
        );
    });

    it('renders the selected DAO dashboard with working section links', () => {
        usePathnameSpy.mockReturnValue('/demo/account/aragon-x/dashboard');

        render(
            <FeatureFlagsProvider initialSnapshot={workspacesSnapshot}>
                <GukModulesProvider>
                    <WorkspaceDemoPageClient
                        path={['account', 'aragon-x', 'dashboard']}
                    />
                </GukModulesProvider>
            </FeatureFlagsProvider>,
        );

        expect(
            screen.getByRole('heading', {
                level: 1,
                name: 'Aragon X (Mainnet)',
            }),
        ).toBeInTheDocument();
        expect(screen.getByText('MULTISIG-265')).toBeInTheDocument();
        expect(
            screen.getAllByRole('link', {
                name: 'app.workspace.demo.action.viewAll',
            })[0],
        ).toHaveAttribute('href', '/demo/account/aragon-x/proposals');
        expect(screen.getByText('eagleops.dao.eth')).toBeInTheDocument();
    });

    it('keeps landing, read-only state, and navigation reachable below lg', async () => {
        const user = userEvent.setup();

        render(
            <FeatureFlagsProvider initialSnapshot={workspacesSnapshot}>
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
        ).toHaveAttribute('href', '/explore');
    });
});

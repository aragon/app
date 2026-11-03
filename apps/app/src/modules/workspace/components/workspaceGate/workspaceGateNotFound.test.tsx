import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { WorkspaceGateNotFound } from './workspaceGateNotFound';

describe('<WorkspaceGateNotFound /> component', () => {
    const createTestComponent = () => (
        <GukModulesProvider>
            <WorkspaceGateNotFound />
        </GukModulesProvider>
    );

    it('renders the not-found state', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceGateNotFound\.heading$/),
        ).toBeInTheDocument();
    });

    it('links to the workspaces of the reader and to the create workspace wizard', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('link', { name: /action\.open$/ }),
        ).toHaveAttribute('href', '/workspace');
        expect(
            screen.getByRole('link', { name: /action\.create$/ }),
        ).toHaveAttribute('href', '/create/workspace');
    });
});

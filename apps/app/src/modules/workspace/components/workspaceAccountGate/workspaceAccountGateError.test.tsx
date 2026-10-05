import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { WorkspaceAccountGateError } from './workspaceAccountGateError';

describe('<WorkspaceAccountGateError /> component', () => {
    it('renders the account error state', () => {
        render(
            <GukModulesProvider>
                <WorkspaceAccountGateError />
            </GukModulesProvider>,
        );

        expect(
            screen.getByText(/workspaceAccountGate\.error\.heading$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceAccountGate\.error\.description$/),
        ).toBeInTheDocument();
    });
});

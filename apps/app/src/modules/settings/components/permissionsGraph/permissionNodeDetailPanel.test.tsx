import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { PermissionNodeDetailPanel } from './permissionNodeDetailPanel';

describe('<PermissionNodeDetailPanel /> component', () => {
    it('shows the plugin version in the header and keeps the type in its definition row', () => {
        render(
            <GukModulesProvider>
                <PermissionNodeDetailPanel
                    node={{
                        id: 'plugin',
                        address: '0x8888888888888888888888888888888888888888',
                        kind: 'plugin',
                        label: 'Test',
                        tag: 'OSx',
                        versionName: 'Staged Proposal Processor v1.1',
                    }}
                    onClose={jest.fn()}
                />
            </GukModulesProvider>,
        );

        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByText('OSx')).toBeInTheDocument();
        expect(
            screen.getByText('Staged Proposal Processor v1.1'),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.settings.daoPermissionsPage.graphView.node.plugin',
            ),
        ).toBeInTheDocument();
    });
});

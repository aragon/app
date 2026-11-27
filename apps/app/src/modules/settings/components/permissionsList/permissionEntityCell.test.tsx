import { AddressResolutionProvider, addressEntryKey } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { IPermissionEntity } from '../../utils/permissionEntityUtils';
import { PermissionEntityCell } from './permissionEntityCell';

describe('<PermissionEntityCell /> component', () => {
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
    // Saved for all networks, so it applies with or without a network on the page.
    const entries = new Map([
        [
            addressEntryKey(address, 0),
            { label: 'Ops wallet', source: 'workspace' as const },
        ],
    ]);

    const renderCell = (entity: Partial<IPermissionEntity>) =>
        render(
            <AddressResolutionProvider entries={entries}>
                <PermissionEntityCell
                    entity={{
                        address,
                        type: 'address',
                        isSentinel: false,
                        ...entity,
                    }}
                />
            </AddressResolutionProvider>,
        );

    it('shows the name of a named entity, not the address book name of its address', () => {
        renderCell({ label: 'Token Voting', type: 'plugin' });

        expect(screen.getByText('Token Voting')).toBeInTheDocument();
        expect(screen.queryByText('Ops wallet')).not.toBeInTheDocument();
    });

    it('names an entity that is only an address from the address book', () => {
        renderCell({});

        expect(screen.getByText('Ops wallet')).toBeInTheDocument();
    });
});

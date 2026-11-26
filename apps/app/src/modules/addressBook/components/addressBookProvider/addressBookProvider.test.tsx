import { AddressOutput } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import {
    type IWorkspace,
    workspaceService,
} from '@/modules/workspace/api/workspaceService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { AddressBookProvider } from './addressBookProvider';

// The ENS resolver is tested alone; here it answers nothing, so no RPC call leaves the test.
jest.mock('../../utils/resolveAddress', () => ({
    createAddressResolver: () => () => Promise.resolve(null),
}));

describe('<AddressBookProvider /> component', () => {
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService,
        'getWorkspaceList',
    );
    const address = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

    const workspace = (name: string, id = 'current'): IWorkspace => ({
        id,
        name: 'Mine',
        description: '',
        avatar: null,
        links: [],
        accounts: [],
        targets: [],
        aliases: [{ address, name, network: null, updatedAt: 1 }],
    });

    const renderProvider = () =>
        render(
            <ReactQueryWrapper client={new QueryClient()}>
                <AddressBookProvider>
                    <AddressOutput address={address} />
                </AddressBookProvider>
            </ReactQueryWrapper>,
        );

    beforeEach(() => {
        useParamsSpy.mockReturnValue({ workspaceId: 'current' });
    });

    afterEach(() => {
        useParamsSpy.mockReset();
        getWorkspaceListSpy.mockReset();
    });

    it('shows the names of the workspaces in the kit widgets, with no label passed', async () => {
        getWorkspaceListSpy.mockResolvedValue([workspace('Treasury')]);
        renderProvider();

        expect(await screen.findByText('Treasury')).toBeInTheDocument();
    });

    it('shows the short address while there are no names', async () => {
        getWorkspaceListSpy.mockResolvedValue([]);
        renderProvider();

        await waitFor(() => expect(getWorkspaceListSpy).toHaveBeenCalled());
        expect(screen.getByText('0xd8dA…6045')).toBeInTheDocument();
    });

    it('shows no edit button, since onEdit is not set', async () => {
        getWorkspaceListSpy.mockResolvedValue([]);
        renderProvider();

        await waitFor(() => expect(getWorkspaceListSpy).toHaveBeenCalled());
        expect(
            screen.queryByRole('button', { name: /Name this address/ }),
        ).not.toBeInTheDocument();
    });

    it('follows the other tabs: a change of the registry in storage reloads the names', async () => {
        getWorkspaceListSpy.mockResolvedValue([workspace('Treasury')]);
        renderProvider();
        await screen.findByText('Treasury');

        getWorkspaceListSpy.mockResolvedValue([workspace('Vault')]);
        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', { key: 'aragon-workspaces' }),
            );
        });

        expect(await screen.findByText('Vault')).toBeInTheDocument();
    });

    it('reloads the names when the storage is cleared in another tab', async () => {
        getWorkspaceListSpy.mockResolvedValue([workspace('Treasury')]);
        renderProvider();
        await screen.findByText('Treasury');

        getWorkspaceListSpy.mockResolvedValue([]);
        act(() => {
            window.dispatchEvent(new StorageEvent('storage', { key: null }));
        });

        await waitFor(() =>
            expect(screen.queryByText('Treasury')).not.toBeInTheDocument(),
        );
    });

    it('ignores storage changes of other keys', async () => {
        getWorkspaceListSpy.mockResolvedValue([workspace('Treasury')]);
        renderProvider();
        await screen.findByText('Treasury');
        const calls = getWorkspaceListSpy.mock.calls.length;

        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', { key: 'something-else' }),
            );
        });

        expect(getWorkspaceListSpy).toHaveBeenCalledTimes(calls);
    });
});

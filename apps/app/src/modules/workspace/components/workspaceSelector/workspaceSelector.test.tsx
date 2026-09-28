import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { type IWorkspace, workspaceService } from '../../api/workspaceService';
import {
    type IWorkspaceSelectorProps,
    WorkspaceSelector,
} from './workspaceSelector';

describe('<WorkspaceSelector /> component', () => {
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService,
        'getWorkspaceList',
    );
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const pushMock = jest.fn();

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'first',
        name: 'First Workspace',
        description: '',
        avatar: null,
        links: [],
        owner: '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419',
        accounts: [],
        targets: [],
        ...workspace,
    });

    const firstWorkspace = buildWorkspace();
    const secondWorkspace = buildWorkspace({
        id: 'second',
        name: 'Second Workspace',
    });

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(firstWorkspace);
        getWorkspaceListSpy.mockResolvedValue([
            firstWorkspace,
            secondWorkspace,
        ]);
        useRouterSpy.mockReturnValue({
            push: pushMock,
        } as unknown as AppRouterInstance);
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getWorkspaceListSpy.mockReset();
        useRouterSpy.mockReset();
        pushMock.mockReset();
    });

    const createTestComponent = (props?: Partial<IWorkspaceSelectorProps>) => {
        const completeProps: IWorkspaceSelectorProps = {
            workspaceId: firstWorkspace.id,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceSelector {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    const openDropdown = async () =>
        userEvent.click(
            await screen.findByRole('button', { name: /First Workspace/ }),
        );

    it('displays the current workspace on the trigger', async () => {
        render(createTestComponent());

        expect(
            await screen.findByRole('button', { name: /First Workspace/ }),
        ).toBeInTheDocument();
    });

    it('lists every workspace followed by the create workspace item', async () => {
        render(createTestComponent());

        await openDropdown();

        const items = await screen.findAllByRole('menuitem');
        expect(items).toHaveLength(3);
        expect(items[0]).toHaveTextContent('First Workspace');
        expect(items[1]).toHaveTextContent('Second Workspace');
        expect(items[2]).toHaveTextContent(/workspaceSelector\.create$/);
    });

    it('opens the overview of the selected workspace', async () => {
        render(createTestComponent());

        await openDropdown();
        await userEvent.click(await screen.findByText('Second Workspace'));

        expect(pushMock).toHaveBeenCalledWith('/workspace/second/overview');
    });

    it('opens the create workspace wizard', async () => {
        render(createTestComponent());

        await openDropdown();
        await userEvent.click(
            await screen.findByText(/workspaceSelector\.create$/),
        );

        expect(pushMock).toHaveBeenCalledWith('/create/workspace');
    });
});

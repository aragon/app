import { addressUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    defaultWorkspaceName,
    type IWorkspace,
    workspaceService,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import {
    type IWorkspaceGateAccountPromptProps,
    WorkspaceGateAccountPrompt,
} from './workspaceGateAccountPrompt';

describe('<WorkspaceGateAccountPrompt /> component', () => {
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService,
        'getWorkspaceList',
    );
    const getOrCreateDefaultWorkspaceSpy = jest.spyOn(
        workspaceService,
        'getOrCreateDefaultWorkspace',
    );
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const useSearchParamsSpy = jest.spyOn(NextNavigation, 'useSearchParams');
    const replaceMock = jest.fn();

    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const accountId = `${Network.ETHEREUM_SEPOLIA}-${address}`;
    const pathname = `/workspace/unknown/${accountId}/proposals`;

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'first',
        name: 'First Workspace',
        description: '',
        avatar: null,
        links: [],
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
        getWorkspaceListSpy.mockResolvedValue([
            firstWorkspace,
            secondWorkspace,
        ]);
        getAccountsSpy.mockResolvedValue([]);
        useRouterSpy.mockReturnValue({
            replace: replaceMock,
        } as unknown as AppRouterInstance);
        usePathnameSpy.mockReturnValue(pathname);
        useSearchParamsSpy.mockReturnValue(
            new URLSearchParams() as unknown as ReturnType<
                typeof NextNavigation.useSearchParams
            >,
        );
    });

    afterEach(() => {
        getWorkspaceListSpy.mockReset();
        getOrCreateDefaultWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
        useRouterSpy.mockReset();
        usePathnameSpy.mockReset();
        useSearchParamsSpy.mockReset();
        replaceMock.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceGateAccountPromptProps>,
        queryClient = new QueryClient(),
    ) => {
        const completeProps: IWorkspaceGateAccountPromptProps = {
            accountId,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={queryClient}>
                    <WorkspaceGateAccountPrompt {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    const getConfirmButton = () =>
        screen.getByRole('button', { name: /action\.confirm$/ });

    it('labels the account with its resolved name', async () => {
        getAccountsSpy.mockResolvedValue([
            {
                network: Network.ETHEREUM_SEPOLIA,
                address,
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
                name: 'Demo DAO',
            },
        ]);
        render(createTestComponent());

        expect(
            await screen.findByText(/description \(account=Demo DAO\)$/),
        ).toBeInTheDocument();
        expect(getAccountsSpy).toHaveBeenCalledWith({
            body: {
                accounts: [{ network: Network.ETHEREUM_SEPOLIA, address }],
            },
        });
    });

    it('labels the account with its truncated address when it has no name', async () => {
        render(createTestComponent());

        expect(
            await screen.findByText(
                `app.workspace.workspaceGateAccountPrompt.description (account=${addressUtils.truncateAddress(address)})`,
            ),
        ).toBeInTheDocument();
    });

    it('lists the workspaces of the reader, the first one preselected', async () => {
        render(createTestComponent());

        expect(
            await screen.findByRole('radio', { name: firstWorkspace.name }),
        ).toBeChecked();
        expect(
            screen.getByRole('radio', { name: secondWorkspace.name }),
        ).not.toBeChecked();
    });

    it('opens the same page, query string included, in the preselected workspace', async () => {
        useSearchParamsSpy.mockReturnValue(
            new URLSearchParams('status=active') as unknown as ReturnType<
                typeof NextNavigation.useSearchParams
            >,
        );
        render(createTestComponent());

        await screen.findByRole('radio', { name: firstWorkspace.name });
        await userEvent.click(getConfirmButton());

        expect(replaceMock).toHaveBeenCalledWith(
            `/workspace/${firstWorkspace.id}/${accountId}/proposals?status=active`,
        );
        expect(getOrCreateDefaultWorkspaceSpy).not.toHaveBeenCalled();
    });

    it('opens the same page in the selected workspace', async () => {
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('radio', { name: secondWorkspace.name }),
        );
        await userEvent.click(getConfirmButton());

        expect(replaceMock).toHaveBeenCalledWith(
            `/workspace/${secondWorkspace.id}/${accountId}/proposals`,
        );
    });

    it('offers the default workspace when the reader has none, seeding it only on confirm', async () => {
        const defaultWorkspace = buildWorkspace({
            id: 'my-workspace-1a2b3c4d',
            name: defaultWorkspaceName,
        });
        const queryClient = new QueryClient();
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        );
        getWorkspaceListSpy.mockResolvedValue([]);
        getOrCreateDefaultWorkspaceSpy.mockResolvedValue(defaultWorkspace);
        render(createTestComponent(undefined, queryClient));

        expect(
            await screen.findByRole('radio', {
                name: `app.workspace.workspaceGateAccountPrompt.newWorkspace (name=${defaultWorkspaceName})`,
            }),
        ).toBeChecked();
        expect(getOrCreateDefaultWorkspaceSpy).not.toHaveBeenCalled();

        await userEvent.click(getConfirmButton());

        await waitFor(() =>
            expect(replaceMock).toHaveBeenCalledWith(
                `/workspace/${defaultWorkspace.id}/${accountId}/proposals`,
            ),
        );
        expect(getOrCreateDefaultWorkspaceSpy).toHaveBeenCalledTimes(1);
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: workspaceServiceKeys.workspaceList(),
        });
    });

    it('renders an error when the default workspace cannot be seeded', async () => {
        getWorkspaceListSpy.mockResolvedValue([]);
        getOrCreateDefaultWorkspaceSpy.mockRejectedValue(new Error('failed'));
        render(createTestComponent());

        await screen.findByRole('radio');
        await userEvent.click(getConfirmButton());

        expect(
            await screen.findByText(/workspaceGate\.error\.title$/),
        ).toBeInTheDocument();
        expect(replaceMock).not.toHaveBeenCalled();
    });

    it('links to the create workspace wizard', async () => {
        render(createTestComponent());

        expect(
            await screen.findByRole('link', { name: /action\.create$/ }),
        ).toHaveAttribute('href', '/create/workspace');
    });
});

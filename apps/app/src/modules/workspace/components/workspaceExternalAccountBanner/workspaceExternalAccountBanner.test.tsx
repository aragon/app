import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
    workspaceServiceKeys,
} from '../../api/workspaceService';
import { WorkspaceAccountState } from '../../constants/workspaceAccountState';
import type {
    IUseWorkspaceAccountOptionsResult,
    IWorkspaceAccountOption,
} from '../../hooks/useWorkspaceAccountOptions';
import * as useWorkspaceAccountOptionsModule from '../../hooks/useWorkspaceAccountOptions';
import { WorkspaceExternalAccountBanner } from './workspaceExternalAccountBanner';

describe('<WorkspaceExternalAccountBanner /> component', () => {
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService,
        'getWorkspaceList',
    );
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const addWorkspaceAccountSpy = jest.spyOn(
        workspaceService,
        'addWorkspaceAccount',
    );
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsModule,
        'useWorkspaceAccountOptions',
    );
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const useSearchParamsSpy = jest.spyOn(NextNavigation, 'useSearchParams');
    const pushMock = jest.fn();

    const externalAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const heldAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const externalAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${externalAddress}`,
        type: WorkspaceAccountType.DAO,
        address: externalAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const heldAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${heldAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: heldAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'current',
        name: 'Current Workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [heldAccount],
        targets: [],
        ...workspace,
    });

    const currentWorkspace = buildWorkspace();
    const otherWorkspace = buildWorkspace({
        id: 'other',
        name: 'Other Workspace',
        accounts: [],
    });
    // Already holds the account, so it is not a target.
    const holdingWorkspace = buildWorkspace({
        id: 'holding',
        name: 'Holding Workspace',
        accounts: [externalAccount],
    });

    const externalOption: IWorkspaceAccountOption = {
        id: externalAccount.id,
        label: 'External DAO',
        account: externalAccount,
        isAllAccounts: false,
        isExternal: true,
    };

    const mockAccountOptions = (
        result?: Partial<IUseWorkspaceAccountOptionsResult>,
    ) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [externalOption],
            accountId: externalAccount.id,
            activeOption: externalOption,
            isAllAccounts: false,
            scopedAccounts: [externalAccount],
            isPending: false,
            ...result,
        });

    beforeEach(() => {
        getWorkspaceListSpy.mockResolvedValue([
            currentWorkspace,
            otherWorkspace,
            holdingWorkspace,
        ]);
        getWorkspaceSpy.mockResolvedValue(currentWorkspace);
        addWorkspaceAccountSpy.mockImplementation(({ urlParams }) =>
            Promise.resolve(buildWorkspace({ id: urlParams.id })),
        );
        mockAccountOptions();
        useParamsSpy.mockReturnValue({
            workspaceId: currentWorkspace.id,
            accountId: externalAccount.id,
        });
        useRouterSpy.mockReturnValue({
            push: pushMock,
        } as unknown as AppRouterInstance);
        usePathnameSpy.mockReturnValue(
            `/workspace/${currentWorkspace.id}/${externalAccount.id}/assets`,
        );
        useSearchParamsSpy.mockReturnValue(
            new URLSearchParams('page=2') as unknown as ReturnType<
                typeof NextNavigation.useSearchParams
            >,
        );
    });

    afterEach(() => {
        getWorkspaceListSpy.mockReset();
        getWorkspaceSpy.mockReset();
        addWorkspaceAccountSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
        useParamsSpy.mockReset();
        useRouterSpy.mockReset();
        usePathnameSpy.mockReset();
        useSearchParamsSpy.mockReset();
        pushMock.mockReset();
    });

    const createTestComponent = (queryClient = new QueryClient()) => (
        <GukModulesProvider>
            <ReactQueryWrapper client={queryClient}>
                <WorkspaceExternalAccountBanner />
            </ReactQueryWrapper>
        </GukModulesProvider>
    );

    const getAddToCurrentButton = () =>
        screen.findByRole('button', { name: /addToCurrent$/ });

    it('renders nothing for an account the workspace holds', () => {
        mockAccountOptions({
            activeOption: { ...externalOption, isExternal: false },
        });
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });

    it('names the account and the workspace it is not part of', async () => {
        render(createTestComponent());

        expect(
            await screen.findByText(
                'app.workspace.workspaceExternalAccountBanner.message (account=External DAO,workspace=Current Workspace)',
            ),
        ).toBeInTheDocument();
    });

    // The workspace is loaded by the gate, while the list only feeds the other workspaces and may still be loading.
    it('names the current workspace and offers to add to it before the list loads', async () => {
        getWorkspaceListSpy.mockReturnValue(new Promise(() => undefined));
        render(createTestComponent());

        expect(
            await screen.findByText(
                'app.workspace.workspaceExternalAccountBanner.message (account=External DAO,workspace=Current Workspace)',
            ),
        ).toBeInTheDocument();
        expect(await getAddToCurrentButton()).toBeEnabled();
    });

    it('appends the account to the current workspace and stays on the page', async () => {
        const queryClient = new QueryClient();
        const invalidateQueriesSpy = jest.spyOn(
            queryClient,
            'invalidateQueries',
        );
        render(createTestComponent(queryClient));

        await userEvent.click(await getAddToCurrentButton());

        await waitFor(() =>
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: workspaceServiceKeys.workspace({
                    urlParams: { id: currentWorkspace.id },
                }),
            }),
        );
        expect(addWorkspaceAccountSpy).toHaveBeenCalledWith({
            urlParams: { id: currentWorkspace.id },
            body: { account: externalAccount },
        });
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
            queryKey: workspaceServiceKeys.workspaceList(),
        });
        expect(pushMock).not.toHaveBeenCalled();
    });

    it('offers only the other workspaces that do not hold the account', async () => {
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('button', { name: /addToOther$/ }),
        );

        const items = await screen.findAllByRole('menuitem');
        expect(items).toHaveLength(1);
        expect(items[0]).toHaveTextContent(otherWorkspace.name);
    });

    it('appends the account to another workspace and opens the same page there', async () => {
        render(createTestComponent());

        await userEvent.click(
            await screen.findByRole('button', { name: /addToOther$/ }),
        );
        await userEvent.click(
            await screen.findByRole('menuitem', { name: otherWorkspace.name }),
        );

        await waitFor(() =>
            expect(pushMock).toHaveBeenCalledWith(
                `/workspace/${otherWorkspace.id}/${externalAccount.id}/assets?page=2`,
            ),
        );
        expect(addWorkspaceAccountSpy).toHaveBeenCalledWith({
            urlParams: { id: otherWorkspace.id },
            body: { account: externalAccount },
        });
    });

    it('hides the other workspaces when there is none to add to', async () => {
        getWorkspaceListSpy.mockResolvedValue([currentWorkspace]);
        render(createTestComponent());

        await getAddToCurrentButton();
        expect(
            screen.queryByRole('button', { name: /addToOther$/ }),
        ).not.toBeInTheDocument();
    });

    it('says so when the account cannot be added', async () => {
        addWorkspaceAccountSpy.mockRejectedValue(
            new Error('QuotaExceededError'),
        );
        render(createTestComponent());

        await userEvent.click(await getAddToCurrentButton());

        expect(
            await screen.findByText(
                'app.workspace.workspaceExternalAccountBanner.error',
            ),
        ).toBeInTheDocument();
        expect(pushMock).not.toHaveBeenCalled();
    });

    // The account is only known once the accounts API has placed the address as a DAO or a Safe, so the banner
    // never shows actions it cannot enable.
    it.each([
        { case: 'the lookup is pending', isPending: true },
        {
            case: 'the address is neither a DAO nor a Safe',
            accountState: WorkspaceAccountState.NOT_FOUND,
        },
        {
            case: 'the lookup is unavailable',
            accountState: WorkspaceAccountState.UNAVAILABLE,
        },
        { case: 'the lookup placed nothing' },
    ])(
        'renders nothing while the account is not resolved because $case',
        ({ isPending = false, accountState }) => {
            mockAccountOptions({
                activeOption: {
                    ...externalOption,
                    account: undefined,
                    accountState,
                },
                scopedAccounts: [],
                isPending,
            });
            const { container } = render(createTestComponent());

            expect(container).toBeEmptyDOMElement();
        },
    );
});

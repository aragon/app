import { GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import * as useWorkspaceAccountOptionsHook from '../../hooks/useWorkspaceAccountOptions';
import {
    type IWorkspaceAccountSelectorProps,
    WorkspaceAccountSelector,
} from './workspaceAccountSelector';

describe('<WorkspaceAccountSelector /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsHook,
        'useWorkspaceAccountOptions',
    );
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const pushMock = jest.fn();
    const prefetchMock = jest.fn();

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const workspace: IWorkspace = {
        id: 'test-workspace',
        name: 'Test Workspace',
        description: '',
        avatar: 'workspace-cid',
        links: [],
        owner: daoAddress,
        accounts: [daoAccount],
        targets: [],
    };

    const allAccountsOption: useWorkspaceAccountOptionsHook.IWorkspaceAccountOption =
        {
            id: 'all',
            label: 'All accounts',
            isAllAccounts: true,
        };

    const daoOption: useWorkspaceAccountOptionsHook.IWorkspaceAccountOption = {
        id: daoAccount.id,
        label: 'Demo DAO',
        account: daoAccount,
        isAllAccounts: false,
    };

    const mockAccountOptions = (
        result?: Partial<useWorkspaceAccountOptionsHook.IUseWorkspaceAccountOptionsResult>,
    ) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [allAccountsOption, daoOption],
            accountId: allAccountsOption.id,
            activeOption: allAccountsOption,
            isAllAccounts: true,
            ...result,
        });

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(workspace);
        getDaoSpy.mockResolvedValue(
            generateDao({ id: daoAccount.id, avatar: 'dao-cid' }),
        );
        cidToSrcSpy.mockImplementation((cid) =>
            cid != null ? `https://ipfs/${cid}` : undefined,
        );
        useRouterSpy.mockReturnValue({
            push: pushMock,
            prefetch: prefetchMock,
        } as unknown as AppRouterInstance);
        usePathnameSpy.mockReturnValue(
            '/workspace/test-workspace/all/proposals',
        );
        mockAccountOptions();
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
        useRouterSpy.mockReset();
        usePathnameSpy.mockReset();
        pushMock.mockReset();
        prefetchMock.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAccountSelectorProps>,
    ) => {
        const completeProps: IWorkspaceAccountSelectorProps = {
            workspaceId: workspace.id,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient(queryClientConfig)}>
                    <WorkspaceAccountSelector {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('displays the name of the active option on the trigger', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('button', { name: /All accounts/ }),
        ).toBeInTheDocument();
    });

    it('lists every option with its avatar, using the workspace avatar for the aggregated option', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(cidToSrcSpy).toHaveBeenCalledWith('dao-cid'),
        );
        await userEvent.click(screen.getByRole('button'));

        const items = await screen.findAllByRole('menuitem');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveTextContent('All accounts');
        expect(items[1]).toHaveTextContent('Demo DAO');
        expect(cidToSrcSpy).toHaveBeenCalledWith('workspace-cid');
    });

    it('links every option to the current section of its own account scope', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));

        const items = await screen.findAllByRole('menuitem');
        expect(items[0]).toHaveAttribute(
            'href',
            '/workspace/test-workspace/all/proposals',
        );
        expect(items[1]).toHaveAttribute(
            'href',
            `/workspace/test-workspace/${daoAccount.id}/proposals`,
        );
    });

    it('links to the overview when the current URL names no section', async () => {
        useRouterSpy.mockReturnValue({
            push: pushMock,
            prefetch: prefetchMock,
        } as unknown as AppRouterInstance);
        usePathnameSpy.mockReturnValue('/workspace/test-workspace');
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));

        const items = await screen.findAllByRole('menuitem');
        expect(items[1]).toHaveAttribute(
            'href',
            `/workspace/test-workspace/${daoAccount.id}/overview`,
        );
    });

    it('renders every option as an anchor, so it can be opened in a new tab', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));

        const items = await screen.findAllByRole('menuitem');
        expect(items[1]?.tagName).toEqual('A');
    });

    it('routes to the clicked option on the client, so the page is not reloaded', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(await screen.findByText('Demo DAO'));

        expect(pushMock).toHaveBeenCalledWith(
            `/workspace/test-workspace/${daoAccount.id}/proposals`,
        );
    });

    it('closes the dropdown on the clicked option, which Radix skips once the click is prevented', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(await screen.findByText('Demo DAO'));

        await waitFor(() =>
            expect(screen.queryByRole('menuitem')).not.toBeInTheDocument(),
        );
    });

    it('prefetches the route of every option when the dropdown opens', async () => {
        render(createTestComponent());

        expect(prefetchMock).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole('button'));

        await waitFor(() =>
            expect(prefetchMock).toHaveBeenCalledWith(
                `/workspace/test-workspace/${daoAccount.id}/proposals`,
            ),
        );
        expect(prefetchMock).toHaveBeenCalledWith(
            '/workspace/test-workspace/all/proposals',
        );
    });

    it('checks the option named by the URL and marks the others as links to follow', async () => {
        mockAccountOptions({
            accountId: daoOption.id,
            activeOption: daoOption,
            isAllAccounts: false,
        });
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));

        const items = await screen.findAllByRole('menuitem');
        expect(
            within(items[1] as HTMLElement).getByTestId(IconType.CHECKMARK),
        ).toBeInTheDocument();
        expect(
            within(items[0] as HTMLElement).getByTestId(IconType.CHEVRON_RIGHT),
        ).toBeInTheDocument();
    });

    it('renders nothing when there is no option to choose between', () => {
        mockAccountOptions({ options: [allAccountsOption] });
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });
});

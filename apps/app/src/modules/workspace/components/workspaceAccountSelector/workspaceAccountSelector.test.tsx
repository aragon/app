import { addressUtils, GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import safeWallet from '@/assets/images/safeWallet.png';
import { queryClientConfig } from '@/modules/application/constants/reactQuery';
import { daoService, Network } from '@/shared/api/daoService';
import { generateDao, ReactQueryWrapper } from '@/shared/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { workspaceQueryService } from '../../api/workspaceQueryService';
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

// The test file transform exports images as a bare file name, which has no `src`; mock it as Next.js would.
jest.mock('@/assets/images/safeWallet.png', () => ({
    __esModule: true,
    default: { src: '/assets/safeWallet.png' },
}));

describe('<WorkspaceAccountSelector /> component', () => {
    // The avatar only mounts its image once the browser reports it as loaded, which jsdom never does.
    const imageSpies: jest.SpyInstance[] = [];
    const stubImageLoading = () => {
        imageSpies.push(
            jest
                .spyOn(HTMLImageElement.prototype, 'complete', 'get')
                .mockReturnValue(true),
            jest
                .spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get')
                .mockReturnValue(1),
        );
    };

    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const getMemberListSpy = jest.spyOn(workspaceQueryService, 'getMemberList');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const useWorkspaceAccountOptionsSpy = jest.spyOn(
        useWorkspaceAccountOptionsHook,
        'useWorkspaceAccountOptions',
    );
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

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

    const safeAddress = '0x1234567890123456789012345678901234567890';

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeOption: useWorkspaceAccountOptionsHook.IWorkspaceAccountOption = {
        id: safeAccount.id,
        label: 'Treasury Safe',
        account: safeAccount,
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
        usePathnameSpy.mockReturnValue(
            '/workspace/test-workspace/all/proposals',
        );
        mockAccountOptions();
    });

    afterEach(() => {
        imageSpies.splice(0).forEach((spy) => spy.mockRestore());
        getWorkspaceSpy.mockReset();
        getDaoSpy.mockReset();
        getMemberListSpy.mockReset();
        cidToSrcSpy.mockReset();
        useWorkspaceAccountOptionsSpy.mockReset();
        usePathnameSpy.mockReset();
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

    it('counts the workspace accounts under the aggregated option', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceAccountSelector\.accounts/),
        ).toBeInTheDocument();
    });

    it('displays the address of the active account under its name', () => {
        mockAccountOptions({ activeOption: daoOption, isAllAccounts: false });
        render(createTestComponent());

        expect(
            screen.getByText(addressUtils.truncateAddress(daoAddress)),
        ).toBeInTheDocument();
    });

    it('displays the address once for an account labelled by its address', () => {
        const truncatedAddress = addressUtils.truncateAddress(daoAddress);
        mockAccountOptions({
            activeOption: { ...daoOption, label: truncatedAddress },
            isAllAccounts: false,
        });
        render(createTestComponent());

        expect(screen.getAllByText(truncatedAddress)).toHaveLength(1);
    });

    it('lists every option with its avatar, using the workspace avatar for the aggregated option, then the add account item', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(cidToSrcSpy).toHaveBeenCalledWith('dao-cid'),
        );
        await userEvent.click(screen.getByRole('button'));

        const items = await screen.findAllByRole('menuitem');
        expect(items).toHaveLength(3);
        expect(items[0]).toHaveTextContent('All accounts');
        expect(items[1]).toHaveTextContent('Demo DAO');
        expect(items[2]).toHaveTextContent(
            /workspaceAccountSelector\.addAccount$/,
        );
        expect(cidToSrcSpy).toHaveBeenCalledWith('workspace-cid');
    });

    it('opens the accounts step of the edit wizard from the add account item, returning to the current page', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));

        expect(
            await screen.findByRole('menuitem', {
                name: /workspaceAccountSelector\.addAccount$/,
            }),
        ).toHaveAttribute(
            'href',
            '/workspace/test-workspace/edit?step=ACCOUNTS&returnTo=%2Fworkspace%2Ftest-workspace%2Fall%2Fproposals',
        );
    });

    it.each(['permissions', 'settings'])(
        'links the options without %s to their overview',
        async (section) => {
            usePathnameSpy.mockReturnValue(
                `/workspace/test-workspace/${daoAccount.id}/${section}`,
            );
            mockAccountOptions({
                options: [allAccountsOption, daoOption, safeOption],
                activeOption: daoOption,
                isAllAccounts: false,
            });
            render(createTestComponent());

            await userEvent.click(screen.getByRole('button'));

            const [all, dao, safe] = await screen.findAllByRole('menuitem');
            expect(all).toHaveAttribute(
                'href',
                '/workspace/test-workspace/all/overview',
            );
            expect(dao).toHaveAttribute(
                'href',
                `/workspace/test-workspace/${daoAccount.id}/${section}`,
            );
            expect(safe).toHaveAttribute(
                'href',
                `/workspace/test-workspace/${safeAccount.id}/overview`,
            );
        },
    );

    it('renders every option as a link to the current section of its own account scope', async () => {
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
        usePathnameSpy.mockReturnValue('/workspace/test-workspace');
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));

        expect(
            await screen.findByRole('menuitem', { name: /Demo DAO/ }),
        ).toHaveAttribute(
            'href',
            `/workspace/test-workspace/${daoAccount.id}/overview`,
        );
    });

    // A member page names a record below the section, and only the section is carried over: switching account
    // links to the members page of each account, not that member under it.
    it('links a member page to the members page of each account', async () => {
        const memberAddress = '0x1234567890123456789012345678901234567890';
        usePathnameSpy.mockReturnValue(
            `/workspace/test-workspace/${daoAccount.id}/members/${memberAddress}`,
        );
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));

        expect(
            await screen.findByRole('menuitem', { name: /Demo DAO/ }),
        ).toHaveAttribute(
            'href',
            `/workspace/test-workspace/${daoAccount.id}/members`,
        );
        // Switching account must cost no lookup of its own.
        expect(getMemberListSpy).not.toHaveBeenCalled();
    });

    it('checks the option named by the URL and marks the others with a chevron', async () => {
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

    it('renders nothing until the workspace is read', () => {
        getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        mockAccountOptions({ options: [allAccountsOption] });
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });

    it('offers to add an account to a workspace holding none', async () => {
        getWorkspaceSpy.mockResolvedValue({ ...workspace, accounts: [] });
        mockAccountOptions({ options: [allAccountsOption] });
        render(createTestComponent());

        await userEvent.click(await screen.findByRole('button'));

        const items = await screen.findAllByRole('menuitem');
        expect(items.map((item) => item.textContent)).toEqual([
            'All accounts',
            expect.stringMatching(/workspaceAccountSelector\.addAccount$/),
        ]);
    });

    it('renders a Safe option with the Safe wallet avatar', async () => {
        stubImageLoading();
        mockAccountOptions({ options: [allAccountsOption, safeOption] });
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));

        const item = await screen.findByRole('menuitem', {
            name: /Treasury Safe/,
        });
        expect(await within(item).findByRole('img')).toHaveAttribute(
            'src',
            safeWallet.src,
        );
    });

    it('prefers the stored avatar of a Safe option', async () => {
        stubImageLoading();
        const safeWithAvatar = {
            ...safeOption,
            account: {
                ...safeAccount,
                metadata: { name: 'Treasury Safe', avatar: 'safe-cid' },
            },
        };
        mockAccountOptions({ options: [allAccountsOption, safeWithAvatar] });
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));

        const item = await screen.findByRole('menuitem', {
            name: /Treasury Safe/,
        });
        expect(await within(item).findByRole('img')).toHaveAttribute(
            'src',
            'https://ipfs/safe-cid',
        );
    });

    it('renders the selector for a workspace holding one Safe, with the Safe avatar on the trigger', async () => {
        stubImageLoading();
        mockAccountOptions({
            options: [allAccountsOption, safeOption],
            accountId: safeOption.id,
            activeOption: safeOption,
            isAllAccounts: false,
        });
        render(createTestComponent());

        const trigger = screen.getByRole('button', { name: /Treasury Safe/ });
        expect(await within(trigger).findByRole('img')).toHaveAttribute(
            'src',
            safeWallet.src,
        );
    });
});

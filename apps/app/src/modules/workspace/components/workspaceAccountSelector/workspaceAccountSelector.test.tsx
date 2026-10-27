import { GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
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
            isExternal: false,
        };

    const daoOption: useWorkspaceAccountOptionsHook.IWorkspaceAccountOption = {
        id: daoAccount.id,
        label: 'Demo DAO',
        account: daoAccount,
        isAllAccounts: false,
        isExternal: false,
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
        isExternal: false,
    };

    const mockAccountOptions = (
        result?: Partial<useWorkspaceAccountOptionsHook.IUseWorkspaceAccountOptionsResult>,
    ) =>
        useWorkspaceAccountOptionsSpy.mockReturnValue({
            options: [allAccountsOption, daoOption],
            accountId: allAccountsOption.id,
            activeOption: allAccountsOption,
            isAllAccounts: true,
            scopedAccounts: [],
            isPending: false,
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

    it('renders nothing when there is no option to choose between', () => {
        mockAccountOptions({ options: [allAccountsOption] });
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
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

    describe('external option', () => {
        const externalAddress = '0x1111111111111111111111111111111111111111';

        const externalAccount: IWorkspaceAccount = {
            id: `${Network.ETHEREUM_SEPOLIA}-${externalAddress}`,
            type: WorkspaceAccountType.DAO,
            address: externalAddress,
            network: Network.ETHEREUM_SEPOLIA,
        };

        const externalOption: useWorkspaceAccountOptionsHook.IWorkspaceAccountOption =
            {
                id: externalAccount.id,
                label: 'External DAO',
                account: externalAccount,
                isAllAccounts: false,
                isExternal: true,
            };

        beforeEach(() => {
            mockAccountOptions({
                options: [allAccountsOption, daoOption, externalOption],
                accountId: externalOption.id,
                activeOption: externalOption,
                isAllAccounts: false,
            });
        });

        it('marks only the external option as not part of the workspace', async () => {
            render(createTestComponent());

            await userEvent.click(screen.getByRole('button'));

            const externalItem = await screen.findByRole('menuitem', {
                name: /External DAO/,
            });
            expect(
                within(externalItem).getByText(/notInWorkspace$/),
            ).toBeInTheDocument();
            expect(externalItem).toHaveAttribute(
                'href',
                `/workspace/test-workspace/${externalAccount.id}/proposals`,
            );
            expect(
                within(
                    screen.getByRole('menuitem', { name: /Demo DAO/ }),
                ).queryByText(/notInWorkspace$/),
            ).not.toBeInTheDocument();
        });

        it('reads the avatar of an external DAO account', async () => {
            stubImageLoading();
            getDaoSpy.mockImplementation(({ urlParams }) =>
                Promise.resolve(
                    generateDao({
                        id: urlParams.id,
                        avatar:
                            urlParams.id === externalAccount.id
                                ? 'external-cid'
                                : 'dao-cid',
                    }),
                ),
            );
            render(createTestComponent());

            await userEvent.click(screen.getByRole('button'));

            const externalItem = await screen.findByRole('menuitem', {
                name: /External DAO/,
            });
            expect(
                await within(externalItem).findByRole('img'),
            ).toHaveAttribute('src', 'https://ipfs/external-cid');
        });
    });
});

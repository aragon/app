import { GukModulesProvider, IconType } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
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

describe('<WorkspaceAccountSelector /> component', () => {
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
        usePathnameSpy.mockReturnValue(
            '/workspace/test-workspace/all/proposals',
        );
        mockAccountOptions();
    });

    afterEach(() => {
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
});

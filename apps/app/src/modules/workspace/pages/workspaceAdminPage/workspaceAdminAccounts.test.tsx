import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { type IDao, Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import { WorkspaceAccountAvatar } from '../../components/workspaceAccountAvatar';
import { WorkspaceWizardStep } from '../../constants/workspaceWizardStep';
import * as useWorkspaceDaosModule from '../../hooks/useWorkspaceDaos';
import { workspaceUtils } from '../../utils/workspaceUtils';
import {
    type IWorkspaceAdminAccountsProps,
    WorkspaceAdminAccounts,
} from './workspaceAdminAccounts';

jest.mock('../../components/workspaceAccountAvatar', () => ({
    WorkspaceAccountAvatar: jest.fn(() => null),
}));

describe('<WorkspaceAdminAccounts /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    const useWorkspaceDaosSpy = jest.spyOn(
        useWorkspaceDaosModule,
        'useWorkspaceDaos',
    );
    const removeWorkspaceAccountSpy = jest.spyOn(
        workspaceService,
        'removeWorkspaceAccount',
    );

    const workspace: IWorkspace = {
        id: 'demo',
        name: 'Demo',
        description: '',
        avatar: null,
        links: [],
        accounts: [
            {
                id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
                type: WorkspaceAccountType.DAO,
                address: daoAddress,
                network: Network.ETHEREUM_SEPOLIA,
            },
            {
                id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
                type: WorkspaceAccountType.SAFE,
                address: safeAddress,
                network: Network.ETHEREUM_SEPOLIA,
                metadata: { name: 'Treasury Safe' },
            },
        ],
        targets: [],
    };

    beforeEach(() => {
        getAccountsSpy.mockResolvedValue([]);
        removeWorkspaceAccountSpy.mockResolvedValue(workspace);
        useWorkspaceDaosSpy.mockReturnValue({ daos: {}, isPending: false });
    });

    afterEach(() => {
        getAccountsSpy.mockReset();
        removeWorkspaceAccountSpy.mockReset();
        useWorkspaceDaosSpy.mockReset();
    });

    const getMenuButtons = () =>
        screen.getAllByRole('button', {
            name: 'app.workspace.workspaceAccountItem.menu',
        });

    const createTestComponent = (
        props?: Partial<IWorkspaceAdminAccountsProps>,
    ) => (
        <ReactQueryWrapper>
            <GukModulesProvider>
                <WorkspaceAdminAccounts workspace={workspace} {...props} />
            </GukModulesProvider>
        </ReactQueryWrapper>
    );

    it('displays one row per account of the workspace', () => {
        render(createTestComponent());

        expect(screen.getByText('Treasury Safe')).toBeInTheDocument();
        expect(getMenuButtons()).toHaveLength(2);
    });

    it('links the add account action to the accounts step of the edit wizard', () => {
        render(createTestComponent());

        expect(
            screen.getByRole('link', {
                name: /workspaceAdminPage.accounts.add/,
            }),
        ).toHaveAttribute(
            'href',
            workspaceUtils.getWorkspaceEditUrl(
                'demo',
                WorkspaceWizardStep.ACCOUNTS,
            ),
        );
    });

    it('displays an empty state for a workspace without accounts', () => {
        render(
            createTestComponent({ workspace: { ...workspace, accounts: [] } }),
        );

        expect(
            screen.getByText(
                'app.workspace.workspaceAdminPage.accounts.empty.heading',
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.workspace.workspaceAdminPage.accounts.empty.description',
            ),
        ).toBeInTheDocument();
    });

    it('removes an account from the workspace', async () => {
        render(createTestComponent());

        await userEvent.click(getMenuButtons()[1]);
        await userEvent.click(
            await screen.findByRole('menuitem', {
                name: 'app.workspace.workspaceAccountItem.remove',
            }),
        );

        await waitFor(() =>
            expect(removeWorkspaceAccountSpy).toHaveBeenCalledWith({
                urlParams: { id: 'demo' },
                body: { accountId: workspace.accounts[1].id },
            }),
        );
    });

    it('displays the avatar of each DAO account, read from the DAO', () => {
        const daoAccount = workspace.accounts[0];
        useWorkspaceDaosSpy.mockReturnValue({
            daos: { [daoAccount.id]: { avatar: 'ipfs://dao-avatar' } as IDao },
            isPending: false,
        });
        render(createTestComponent());

        expect(useWorkspaceDaosSpy).toHaveBeenCalledWith(workspace.accounts);
        // The DAOs carry the names too, so no accounts lookup is needed.
        expect(getAccountsSpy).not.toHaveBeenCalled();
        expect(WorkspaceAccountAvatar).toHaveBeenCalledWith(
            expect.objectContaining({ avatar: 'ipfs://dao-avatar' }),
            undefined,
        );
    });

    it('shows an error when the account cannot be removed', async () => {
        removeWorkspaceAccountSpy.mockRejectedValue(new Error('storage'));
        render(createTestComponent());

        await userEvent.click(getMenuButtons()[0]);
        await userEvent.click(
            await screen.findByRole('menuitem', {
                name: 'app.workspace.workspaceAccountItem.remove',
            }),
        );

        expect(
            await screen.findByText(
                'app.workspace.workspaceAdminPage.accounts.removeError',
            ),
        ).toBeInTheDocument();
    });
});

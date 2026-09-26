import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
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
import * as workspaceAccountSelectorProvider from '../workspaceAccountSelectorProvider';
import {
    type IWorkspaceAccountSelectorProps,
    WorkspaceAccountSelector,
} from './workspaceAccountSelector';

describe('<WorkspaceAccountSelector /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getDaoSpy = jest.spyOn(daoService, 'getDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const useWorkspaceAccountSelectorContextSpy = jest.spyOn(
        workspaceAccountSelectorProvider,
        'useWorkspaceAccountSelectorContext',
    );
    const setActiveOptionMock = jest.fn();

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

    const allAccountsOption: workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption =
        { id: 'all', label: 'All accounts', isAllAccounts: true };

    const daoOption: workspaceAccountSelectorProvider.IWorkspaceAccountFilterOption =
        {
            id: daoAccount.id,
            label: 'Demo DAO',
            account: daoAccount,
            isAllAccounts: false,
        };

    const mockAccountSelector = (
        context?: Partial<workspaceAccountSelectorProvider.IWorkspaceAccountSelectorContext>,
    ) =>
        useWorkspaceAccountSelectorContextSpy.mockReturnValue({
            activeOption: allAccountsOption,
            setActiveOption: setActiveOptionMock,
            options: [allAccountsOption, daoOption],
            ...context,
        });

    beforeEach(() => {
        getWorkspaceSpy.mockResolvedValue(workspace);
        getDaoSpy.mockResolvedValue(
            generateDao({ id: daoAccount.id, avatar: 'dao-cid' }),
        );
        cidToSrcSpy.mockImplementation((cid) =>
            cid != null ? `https://ipfs/${cid}` : undefined,
        );
        mockAccountSelector();
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
        useWorkspaceAccountSelectorContextSpy.mockReset();
        setActiveOptionMock.mockReset();
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

    it('selects the clicked option', async () => {
        render(createTestComponent());

        await userEvent.click(screen.getByRole('button'));
        await userEvent.click(await screen.findByText('Demo DAO'));

        expect(setActiveOptionMock).toHaveBeenCalledWith(daoOption);
    });

    it('renders nothing when there is no option to choose between', () => {
        mockAccountSelector({ options: [allAccountsOption] });
        const { container } = render(createTestComponent());

        expect(container).toBeEmptyDOMElement();
    });
});

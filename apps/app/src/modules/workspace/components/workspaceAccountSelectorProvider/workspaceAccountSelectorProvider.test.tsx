import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as NextNavigation from 'next/navigation';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    WorkspaceAccountInfoStatus,
    WorkspaceAccountInfoType,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import {
    type IWorkspace,
    type IWorkspaceAccount,
    WorkspaceAccountType,
    workspaceService,
} from '../../api/workspaceService';
import {
    type IWorkspaceAccountSelectorProviderProps,
    useWorkspaceAccountSelectorContext,
    WorkspaceAccountSelectorProvider,
    workspaceAccountFilterParam,
} from './workspaceAccountSelectorProvider';

describe('<WorkspaceAccountSelectorProvider /> component', () => {
    const daoAddress = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';
    const safeAddress = '0xA941b1C1D9aDC88C9241aA3ACA59E8B8f0386419';

    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    const useSearchParamsSpy = jest.spyOn(NextNavigation, 'useSearchParams');

    const daoAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${daoAddress}`,
        type: WorkspaceAccountType.DAO,
        address: daoAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const safeAccount: IWorkspaceAccount = {
        id: `${Network.ETHEREUM_SEPOLIA}-${safeAddress}`,
        type: WorkspaceAccountType.SAFE,
        address: safeAddress,
        network: Network.ETHEREUM_SEPOLIA,
    };

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'test-workspace',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        owner: daoAddress,
        accounts: [daoAccount, safeAccount],
        targets: [],
        ...workspace,
    });

    const allAccountsLabel =
        'app.workspace.workspaceAccountSelectorProvider.allAccounts';

    /**
     * Renders the context values, and selects the DAO option on click.
     */
    const ContextConsumer: React.FC = () => {
        const { activeOption, setActiveOption, options } =
            useWorkspaceAccountSelectorContext();

        const handleSelectDao = () => {
            const daoOption = options.find(
                (option) => option.account?.id === daoAccount.id,
            );

            if (daoOption != null) {
                setActiveOption(daoOption);
            }
        };

        return (
            <div>
                <p data-testid="active">{activeOption?.label}</p>
                <ul>
                    {options.map((option) => (
                        <li key={option.id}>{option.label}</li>
                    ))}
                </ul>
                <button onClick={handleSelectDao} type="button">
                    select DAO
                </button>
            </div>
        );
    };

    beforeEach(() => {
        useSearchParamsSpy.mockReturnValue(
            new URLSearchParams() as ReturnType<
                typeof NextNavigation.useSearchParams
            >,
        );
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        getAccountsSpy.mockResolvedValue([
            {
                network: Network.ETHEREUM_SEPOLIA,
                address: daoAddress,
                type: WorkspaceAccountInfoType.DAO,
                status: WorkspaceAccountInfoStatus.AVAILABLE,
                indexed: true,
                name: 'Demo DAO',
            },
        ]);
    });

    afterEach(() => {
        useSearchParamsSpy.mockReset();
        getWorkspaceSpy.mockReset();
        getAccountsSpy.mockReset();
        window.history.replaceState(null, '', '/');
    });

    const createTestComponent = (
        props?: Partial<IWorkspaceAccountSelectorProviderProps>,
    ) => {
        const completeProps: IWorkspaceAccountSelectorProviderProps = {
            workspaceId: 'test-workspace',
            children: <ContextConsumer />,
            ...props,
        };

        return (
            <ReactQueryWrapper client={new QueryClient()}>
                <WorkspaceAccountSelectorProvider {...completeProps} />
            </ReactQueryWrapper>
        );
    };

    it('renders a spinner instead of the children while the workspace is loading', () => {
        getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        render(createTestComponent());

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByTestId('active')).not.toBeInTheDocument();
    });

    it('renders an error instead of the children when the workspace fails to load', async () => {
        getWorkspaceSpy.mockRejectedValue(new Error('failed'));
        render(createTestComponent());

        expect(
            await screen.findByText(
                /workspaceAccountSelectorProvider\.error\.title$/,
            ),
        ).toBeInTheDocument();
        expect(screen.queryByTestId('active')).not.toBeInTheDocument();
    });

    it('offers the aggregated option first, followed by the DAO accounts only', async () => {
        render(createTestComponent());

        await waitFor(() =>
            expect(screen.getAllByRole('listitem')).toHaveLength(2),
        );
        const [allOption, daoOption] = screen.getAllByRole('listitem');
        expect(allOption).toHaveTextContent(allAccountsLabel);
        await waitFor(() => expect(daoOption).toHaveTextContent('Demo DAO'));
    });

    it('selects the aggregated option by default', async () => {
        render(createTestComponent());

        expect(await screen.findByTestId('active')).toHaveTextContent(
            allAccountsLabel,
        );
    });

    it('selects the option set on the URL', async () => {
        useSearchParamsSpy.mockReturnValue(
            new URLSearchParams({
                [workspaceAccountFilterParam]: daoAccount.id,
            }) as ReturnType<typeof NextNavigation.useSearchParams>,
        );
        render(createTestComponent());

        await waitFor(() =>
            expect(screen.getByTestId('active')).toHaveTextContent('Demo DAO'),
        );
    });

    it('selects the given option and sets it on the URL', async () => {
        render(createTestComponent());

        await userEvent.click(await screen.findByRole('button'));

        await waitFor(() =>
            expect(screen.getByTestId('active')).toHaveTextContent('Demo DAO'),
        );
        const urlParams = new URLSearchParams(window.location.search);
        expect(urlParams.get(workspaceAccountFilterParam)).toEqual(
            daoAccount.id,
        );
    });

    it('does not set the aggregated option on the URL', async () => {
        render(createTestComponent());

        await screen.findByTestId('active');

        const urlParams = new URLSearchParams(window.location.search);
        expect(urlParams.get(workspaceAccountFilterParam)).toBeNull();
    });

    it('does not resolve account names for a workspace that has none', async () => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace({ accounts: [] }));
        render(createTestComponent());

        await screen.findByTestId('active');
        expect(getAccountsSpy).not.toHaveBeenCalled();
    });

    it('throws when the context is used outside of the provider', () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => undefined);

        expect(() => render(<ContextConsumer />)).toThrow(
            /must be used inside a WorkspaceAccountSelectorContext provider/,
        );

        consoleErrorSpy.mockRestore();
    });
});

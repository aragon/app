import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import * as NextNavigation from 'next/navigation';
import { AragonBackendServiceError } from '@/shared/api/aragonBackendService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import { workspaceQueryService } from '../../api/workspaceQueryService';
import { type IWorkspace, workspaceService } from '../../api/workspaceService';
import { type IWorkspaceGateProps, WorkspaceGate } from './workspaceGate';

describe('<WorkspaceGate /> component', () => {
    const getWorkspaceSpy = jest.spyOn(workspaceService, 'getWorkspace');
    const getWorkspaceListSpy = jest.spyOn(
        workspaceService,
        'getWorkspaceList',
    );
    const getAccountsSpy = jest.spyOn(workspaceQueryService, 'getAccounts');
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');
    const useSearchParamsSpy = jest.spyOn(NextNavigation, 'useSearchParams');

    const notFoundError = new AragonBackendServiceError(
        AragonBackendServiceError.notFoundCode,
        'Workspace not found (id=demo)',
        404,
    );

    // The gate only cares whether the workspace resolves, not what it holds.
    const buildWorkspace = (): IWorkspace => ({
        id: 'demo',
        name: 'Test Workspace',
        description: '',
        avatar: null,
        links: [],
        accounts: [],
        targets: [],
    });

    beforeEach(() => {
        useParamsSpy.mockReturnValue({ workspaceId: 'demo' });
        getWorkspaceListSpy.mockResolvedValue([]);
        getAccountsSpy.mockResolvedValue([]);
        useRouterSpy.mockReturnValue({
            replace: jest.fn(),
        } as unknown as AppRouterInstance);
        usePathnameSpy.mockReturnValue('/workspace/demo');
        useSearchParamsSpy.mockReturnValue(
            new URLSearchParams() as unknown as ReturnType<
                typeof NextNavigation.useSearchParams
            >,
        );
    });

    afterEach(() => {
        getWorkspaceSpy.mockReset();
        getWorkspaceListSpy.mockReset();
        getAccountsSpy.mockReset();
        useParamsSpy.mockReset();
        useRouterSpy.mockReset();
        usePathnameSpy.mockReset();
        useSearchParamsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IWorkspaceGateProps>) => {
        const completeProps: IWorkspaceGateProps = {
            workspaceId: 'demo',
            children: <p>page</p>,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ReactQueryWrapper client={new QueryClient()}>
                    <WorkspaceGate {...completeProps} />
                </ReactQueryWrapper>
            </GukModulesProvider>
        );
    };

    it('renders the page once the workspace has loaded', async () => {
        getWorkspaceSpy.mockResolvedValue(buildWorkspace());
        render(createTestComponent());

        expect(await screen.findByText('page')).toBeInTheDocument();
    });

    it('holds the page back behind a loading state while the workspace loads', () => {
        getWorkspaceSpy.mockReturnValue(new Promise(() => undefined));
        render(createTestComponent());

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.queryByText('page')).not.toBeInTheDocument();
    });

    it('renders an error instead of the page when the workspace fails to load', async () => {
        getWorkspaceSpy.mockRejectedValue(new Error('failed'));
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceGate\.error\.title$/),
        ).toBeInTheDocument();
        expect(screen.queryByText('page')).not.toBeInTheDocument();
    });

    it.each([
        { scope: 'a route with no account', params: {} },
        { scope: 'the aggregated scope', params: { accountId: 'all' } },
        {
            scope: 'an invalid account segment',
            params: { accountId: 'unknown' },
        },
    ])(
        'renders the not-found state for an unknown workspace on $scope',
        async ({ params }) => {
            useParamsSpy.mockReturnValue({ workspaceId: 'demo', ...params });
            getWorkspaceSpy.mockRejectedValue(notFoundError);
            render(createTestComponent());

            expect(
                await screen.findByText(/workspaceGateNotFound\.heading$/),
            ).toBeInTheDocument();
            expect(screen.queryByText('page')).not.toBeInTheDocument();
        },
    );

    it('offers to open the page in another workspace for an unknown workspace on an account scope', async () => {
        useParamsSpy.mockReturnValue({
            workspaceId: 'demo',
            accountId:
                'ethereum-sepolia-0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
        });
        getWorkspaceSpy.mockRejectedValue(notFoundError);
        render(createTestComponent());

        expect(
            await screen.findByText(/workspaceGateAccountPrompt\.heading$/),
        ).toBeInTheDocument();
        expect(screen.queryByText('page')).not.toBeInTheDocument();
    });
});

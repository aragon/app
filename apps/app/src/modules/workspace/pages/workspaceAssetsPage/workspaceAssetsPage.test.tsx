import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { featureFlags } from '@/shared/featureFlags';
import {
    type IWorkspaceAssetsPageProps,
    WorkspaceAssetsPage,
    workspaceAssetsCount,
} from './workspaceAssetsPage';
import { WorkspaceAssetsPageClient } from './workspaceAssetsPageClient';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceAssetsPageClient', () => ({
    WorkspaceAssetsPageClient: jest.fn(() => (
        <div data-testid="page-client-mock" />
    )),
}));

describe('<WorkspaceAssetsPage /> component', () => {
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
        jest.mocked(WorkspaceAssetsPageClient).mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAssetsPageProps>,
    ) => {
        const completeProps: IWorkspaceAssetsPageProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            ...props,
        };
        const Component = await WorkspaceAssetsPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the assets page and passes the workspace id to the client when the feature is enabled', async () => {
        isEnabledSpy.mockResolvedValue(true);

        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(WorkspaceAssetsPageClient).toHaveBeenCalledWith(
            { workspaceId: 'demo', pageSize: workspaceAssetsCount },
            undefined,
        );
    });

    // The page serves the account-scoped route too, and the scope is resolved on the client: the aggregated route
    // spells the account as a static segment, so there is no account parameter for the server to read there.
    it('passes nothing but the workspace id under an account-scoped route', async () => {
        render(
            await createTestComponent({
                params: Promise.resolve({
                    workspaceId: 'demo',
                    accountId:
                        'ethereum-sepolia-0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
                }),
            }),
        );

        expect(WorkspaceAssetsPageClient).toHaveBeenCalledWith(
            { workspaceId: 'demo', pageSize: workspaceAssetsCount },
            undefined,
        );
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
    });
});

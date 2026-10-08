import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { featureFlags } from '@/shared/featureFlags';
import {
    type IWorkspaceMembersPageProps,
    WorkspaceMembersPage,
    workspaceMembersCount,
} from './workspaceMembersPage';
import { WorkspaceMembersPageClient } from './workspaceMembersPageClient';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceMembersPageClient', () => ({
    WorkspaceMembersPageClient: jest.fn(() => (
        <div data-testid="page-client-mock" />
    )),
}));

describe('<WorkspaceMembersPage /> component', () => {
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
        (WorkspaceMembersPageClient as jest.Mock).mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceMembersPageProps>,
    ) => {
        const completeProps: IWorkspaceMembersPageProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            ...props,
        };
        const Component = await WorkspaceMembersPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the members page when the workspaces feature is enabled', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
    });

    it('hands the client the workspace and the page size', async () => {
        render(await createTestComponent());

        expect(WorkspaceMembersPageClient).toHaveBeenCalledWith(
            { workspaceId: 'demo', pageSize: workspaceMembersCount },
            undefined,
        );
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
        expect(
            screen.queryByTestId('page-client-mock'),
        ).not.toBeInTheDocument();
    });
});

import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { featureFlags } from '@/shared/featureFlags';
import {
    type IWorkspaceAdminPageProps,
    WorkspaceAdminPage,
} from './workspaceAdminPage';
import { WorkspaceAdminPageClient } from './workspaceAdminPageClient';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceAdminPageClient', () => ({
    WorkspaceAdminPageClient: jest.fn(() => <div>page-client-mock</div>),
}));

describe('<WorkspaceAdminPage /> component', () => {
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceAdminPageProps>,
    ) => {
        const completeProps: IWorkspaceAdminPageProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            ...props,
        };
        const Component = await WorkspaceAdminPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('passes the workspace id to the client when the workspaces feature is enabled', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByText('page-client-mock')).toBeInTheDocument();
        expect(WorkspaceAdminPageClient).toHaveBeenCalledWith(
            expect.objectContaining({ workspaceId: 'demo' }),
            undefined,
        );
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
        expect(screen.queryByText('page-client-mock')).not.toBeInTheDocument();
    });
});

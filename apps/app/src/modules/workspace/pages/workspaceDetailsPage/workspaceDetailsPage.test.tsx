import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { featureFlags } from '@/shared/featureFlags';
import {
    type IWorkspaceDetailsPageProps,
    WorkspaceDetailsPage,
} from './workspaceDetailsPage';
import { WorkspaceDetailsPageClient } from './workspaceDetailsPageClient';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceDetailsPageClient', () => ({
    WorkspaceDetailsPageClient: jest.fn(() => (
        <div data-testid="page-client-mock" />
    )),
}));

describe('<WorkspaceDetailsPage /> component', () => {
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
        props?: Partial<IWorkspaceDetailsPageProps>,
    ) => {
        const completeProps: IWorkspaceDetailsPageProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            ...props,
        };
        const Component = await WorkspaceDetailsPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('passes the workspace id to the client when the workspaces feature is enabled', async () => {
        isEnabledSpy.mockResolvedValue(true);

        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(WorkspaceDetailsPageClient).toHaveBeenCalledWith(
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
    });
});

import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { featureFlags } from '@/shared/featureFlags';
import {
    type IWorkspaceTodosPageProps,
    WorkspaceTodosPage,
} from './workspaceTodosPage';
import { WorkspaceTodosPageClient } from './workspaceTodosPageClient';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceTodosPageClient', () => ({
    WorkspaceTodosPageClient: jest.fn(() => (
        <div data-testid="page-client-mock" />
    )),
}));

describe('<WorkspaceTodosPage /> component', () => {
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
        props?: Partial<IWorkspaceTodosPageProps>,
    ) => {
        const completeProps: IWorkspaceTodosPageProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            ...props,
        };
        const Component = await WorkspaceTodosPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    it('renders the client for the workspace on the route when the workspaces feature is enabled', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(WorkspaceTodosPageClient).toHaveBeenCalledWith(
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

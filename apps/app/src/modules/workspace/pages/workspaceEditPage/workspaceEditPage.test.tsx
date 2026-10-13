import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import type { ReactNode } from 'react';
import { featureFlags } from '@/shared/featureFlags';
import * as workspaceGate from '../../components/workspaceGate';
import {
    type IWorkspaceEditPageProps,
    WorkspaceEditPage,
} from './workspaceEditPage';
import { WorkspaceEditPageClient } from './workspaceEditPageClient';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceEditPageClient', () => ({
    WorkspaceEditPageClient: jest.fn(() => (
        <div data-testid="page-client-mock" />
    )),
}));

describe('<WorkspaceEditPage /> component', () => {
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const workspaceGateSpy = jest.spyOn(workspaceGate, 'WorkspaceGate');

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
        workspaceGateSpy.mockImplementation(
            (props: { children?: ReactNode }) => (
                <div data-testid="workspace-gate-mock">{props.children}</div>
            ),
        );
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        workspaceGateSpy.mockReset();
        notFoundMock.mockClear();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceEditPageProps>,
    ) => {
        const completeProps: IWorkspaceEditPageProps = {
            params: Promise.resolve({ workspaceId: 'demo' }),
            ...props,
        };
        const Component = await WorkspaceEditPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    // The page sits under the wizard layout rather than `LayoutWorkspace`, so it renders the gate itself.
    it('renders the client inside the workspace gate when the workspaces feature is enabled', async () => {
        render(await createTestComponent());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(workspaceGateSpy).toHaveBeenCalledWith(
            expect.objectContaining({ workspaceId: 'demo' }),
            undefined,
        );
        expect(WorkspaceEditPageClient).toHaveBeenCalledWith(
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
        expect(
            screen.queryByTestId('page-client-mock'),
        ).not.toBeInTheDocument();
    });
});

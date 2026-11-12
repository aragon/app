import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as workspaceGate from '../../components/workspaceGate';
import {
    type IWorkspaceCreateTransactionPageProps,
    WorkspaceCreateTransactionPage,
} from './workspaceCreateTransactionPage';
import * as pageClient from './workspaceCreateTransactionPageClient';

describe('<WorkspaceCreateTransactionPage /> component', () => {
    const workspaceGateSpy = jest.spyOn(workspaceGate, 'WorkspaceGate');
    const pageClientSpy = jest.spyOn(
        pageClient,
        'WorkspaceCreateTransactionPageClient',
    );

    beforeEach(() => {
        pageClientSpy.mockImplementation(() => (
            <div data-testid="page-client-mock" />
        ));
        workspaceGateSpy.mockImplementation(
            (props: { children?: ReactNode }) => (
                <div data-testid="workspace-gate-mock">{props.children}</div>
            ),
        );
    });

    afterEach(() => {
        workspaceGateSpy.mockReset();
        pageClientSpy.mockReset();
    });

    const createTestComponent = async (
        props?: Partial<IWorkspaceCreateTransactionPageProps>,
    ) => {
        const completeProps: IWorkspaceCreateTransactionPageProps = {
            params: Promise.resolve({
                workspaceId: 'demo',
                accountId: 'ethereum-sepolia-0x1234',
            }),
            ...props,
        };
        const Component = await WorkspaceCreateTransactionPage(completeProps);

        return <GukModulesProvider>{Component}</GukModulesProvider>;
    };

    // The page sits under the wizard layout rather than `LayoutWorkspace`, so it renders the gate itself.
    it('renders the client inside the workspace gate', async () => {
        render(await createTestComponent());

        expect(screen.getByTestId('page-client-mock')).toBeInTheDocument();
        expect(workspaceGateSpy).toHaveBeenCalledWith(
            expect.objectContaining({ workspaceId: 'demo' }),
            undefined,
        );
    });
});

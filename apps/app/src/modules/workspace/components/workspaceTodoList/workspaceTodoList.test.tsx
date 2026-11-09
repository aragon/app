import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import {
    type IWorkspaceAccount,
    WorkspaceAccountType,
} from '../../api/workspaceService';
import type { IWorkspaceTodoContentProps } from './workspaceTodoContent';
import {
    type IWorkspaceTodoListProps,
    WorkspaceTodoList,
    workspaceTodoPreviewSize,
} from './workspaceTodoList';

// The content is tested on its own; here it only needs to say what it was asked to preview.
jest.mock('./workspaceTodoContent', () => ({
    WorkspaceTodoContent: (props: IWorkspaceTodoContentProps) => (
        <p>{`content ${props.previewSize?.toString() ?? ''} ${props.viewAllHref ?? ''}`}</p>
    ),
}));

describe('<WorkspaceTodoList /> component', () => {
    const account: IWorkspaceAccount = {
        id: 'ethereum-sepolia-0xDao',
        type: WorkspaceAccountType.DAO,
        network: Network.ETHEREUM_SEPOLIA,
        address: '0xDao',
    };

    const createTestComponent = (props?: Partial<IWorkspaceTodoListProps>) => {
        const completeProps: IWorkspaceTodoListProps = {
            accounts: [account],
            workspaceId: 'test-workspace',
            workspaceName: 'My Workspace',
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceTodoList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders nothing for a workspace without accounts', () => {
        const { container } = render(createTestComponent({ accounts: [] }));

        expect(container).toBeEmptyDOMElement();
    });

    it('names the workspace in the section description', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceTodoList\.title$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /workspaceTodoList\.description \(workspace=My Workspace\)/,
            ),
        ).toBeInTheDocument();
    });

    it('previews the rows and leads the rest to the aggregated to-dos page', () => {
        render(createTestComponent());

        expect(
            screen.getByText(
                `content ${workspaceTodoPreviewSize.toString()} /workspace/test-workspace/all/todos`,
            ),
        ).toBeInTheDocument();
    });
});

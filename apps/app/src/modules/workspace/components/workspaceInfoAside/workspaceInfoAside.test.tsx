import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import type { IWorkspace } from '../../api/workspaceService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import {
    type IWorkspaceInfoAsideProps,
    WorkspaceInfoAside,
} from './workspaceInfoAside';

describe('<WorkspaceInfoAside /> component', () => {
    const address = '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5';

    const buildWorkspace = (workspace?: Partial<IWorkspace>): IWorkspace => ({
        id: 'test-workspace',
        name: 'Test Workspace',
        description: 'A test workspace',
        avatar: null,
        links: [],
        owner: address,
        accounts: [
            {
                id: `${Network.ETHEREUM_SEPOLIA}-${address}`,
                type: WorkspaceAccountType.DAO,
                address,
                network: Network.ETHEREUM_SEPOLIA,
            },
        ],
        targets: [],
        ...workspace,
    });

    const createTestComponent = (props?: Partial<IWorkspaceInfoAsideProps>) => {
        const completeProps: IWorkspaceInfoAsideProps = {
            workspace: buildWorkspace(),
            stats: [],
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceInfoAside {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the description, the owner and the number of accounts', () => {
        render(createTestComponent());

        expect(screen.getByText('A test workspace')).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceInfoAside\.owner$/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/workspaceInfoAside\.accounts$/),
        ).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('does not render an empty description', () => {
        render(
            createTestComponent({
                workspace: buildWorkspace({ description: '  ' }),
            }),
        );

        expect(
            screen.queryByRole('button', { name: /readMore$/ }),
        ).not.toBeInTheDocument();
    });

    it('renders the given stats', () => {
        render(
            createTestComponent({
                stats: [{ label: 'Transactions', value: '12' }],
            }),
        );

        expect(screen.getByText('Transactions')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('renders the workspace links', () => {
        render(
            createTestComponent({
                workspace: buildWorkspace({
                    links: [{ name: 'Forum', url: 'https://forum.example' }],
                }),
            }),
        );

        expect(screen.getByRole('link', { name: /Forum/ })).toHaveAttribute(
            'href',
            'https://forum.example',
        );
    });
});

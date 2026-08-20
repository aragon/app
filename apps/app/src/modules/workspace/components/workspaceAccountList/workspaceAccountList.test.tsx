import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { WorkspaceAccountType } from '../../api/workspaceService';
import type { IWorkspaceAccount } from '../../types';
import {
    type IWorkspaceAccountListProps,
    WorkspaceAccountList,
} from './workspaceAccountList';

describe('<WorkspaceAccountList /> component', () => {
    const createTestComponent = (
        props?: Partial<IWorkspaceAccountListProps>,
    ) => {
        const completeProps: IWorkspaceAccountListProps = {
            accounts: [],
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceAccountList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the empty state when no account holds a gate', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/workspaceAccountList.empty.heading/),
        ).toBeInTheDocument();
    });

    it('renders one item per account with its truncated address', () => {
        const accounts: IWorkspaceAccount[] = [
            {
                address: '0x652a31c669f9AB37f6040f279139a75D04F2679e',
                type: WorkspaceAccountType.DAO,
                ref: null,
                targets: [],
                gateCount: 0,
                capabilityCount: 3,
            },
            {
                address: '0x1703ed1bFacC04b7eB654b297aA4E52EBC008722',
                type: WorkspaceAccountType.EOA,
                ref: null,
                targets: [],
                gateCount: 0,
                capabilityCount: 1,
            },
        ];

        render(createTestComponent({ accounts }));

        expect(screen.getByText('0x652a…679e')).toBeInTheDocument();
        expect(screen.getByText('0x1703…8722')).toBeInTheDocument();
        expect(screen.getByText('dao')).toBeInTheDocument();
        expect(screen.getByText('eoa')).toBeInTheDocument();
    });
});

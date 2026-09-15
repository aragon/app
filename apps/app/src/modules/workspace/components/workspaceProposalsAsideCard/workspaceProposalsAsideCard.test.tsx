import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import {
    type IWorkspaceProposalsAsideCardProps,
    WorkspaceProposalsAsideCard,
} from './workspaceProposalsAsideCard';

describe('<WorkspaceProposalsAsideCard /> component', () => {
    const createTestComponent = (
        props?: Partial<IWorkspaceProposalsAsideCardProps>,
    ) => {
        const completeProps: IWorkspaceProposalsAsideCardProps = {
            title: 'All proposals',
            daosCount: 2,
            ...props,
        };

        return (
            <GukModulesProvider>
                <WorkspaceProposalsAsideCard {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('displays the totals of the aggregated selection', () => {
        render(
            createTestComponent({
                title: 'All proposals',
                proposalsCount: 12,
                daosCount: 3,
            }),
        );

        expect(screen.getByText('All proposals')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays a placeholder for the stats that have not loaded yet', () => {
        render(createTestComponent({ proposalsCount: undefined }));

        // Total and most-recent are both unknown, the DAO count is always known.
        expect(screen.getAllByText('-')).toHaveLength(2);
    });

    it('displays how long ago the most recent proposal was created', () => {
        const timestamp = DateTime.now().minus({ days: 3 }).toSeconds();
        render(
            createTestComponent({ mostRecentTimestamp: Math.floor(timestamp) }),
        );

        expect(screen.getByText('3')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.workspace.workspaceProposalsAsideCard.recentUnit (unit=days)',
            ),
        ).toBeInTheDocument();
    });
});

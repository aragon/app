import { render, screen } from '@testing-library/react';
import {
    type IWorkspaceListItemSummaryProps,
    WorkspaceListItemSummary,
} from './workspaceListItemSummary';

describe('<WorkspaceListItemSummary /> component', () => {
    const createTestComponent = (
        props?: Partial<IWorkspaceListItemSummaryProps>,
    ) => {
        const completeProps: IWorkspaceListItemSummaryProps = {
            avatar: <span>avatar</span>,
            title: 'Ecosystem incentives',
            ...props,
        };

        return <WorkspaceListItemSummary {...completeProps} />;
    };

    it('renders the avatar, the title and the description', () => {
        render(createTestComponent({ description: 'Voting ends in 5 days' }));

        expect(screen.getByText('avatar')).toBeInTheDocument();
        expect(screen.getByText('Ecosystem incentives')).toBeInTheDocument();
        expect(screen.getByText('Voting ends in 5 days')).toBeInTheDocument();
    });

    it('renders the identifier, the value and the tag when set', () => {
        render(
            createTestComponent({
                identifier: 'GOV-3',
                value: '10 ETH',
                tag: { label: 'Executed' },
            }),
        );

        expect(screen.getByText('GOV-3')).toBeInTheDocument();
        expect(screen.getByText('10 ETH')).toBeInTheDocument();
        expect(screen.getByText('Executed')).toBeInTheDocument();
    });
});

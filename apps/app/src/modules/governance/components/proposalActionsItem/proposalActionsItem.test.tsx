import { GukModulesProvider, ProposalActions } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initUpdateMetadataActionViews } from '@/actions/core/updateMetadata';
import {
    generateProposalActionUpdateMetadata,
    generateProposalActionUpdatePluginMetadata,
} from '../../testUtils';
import {
    type IProposalActionsItemProps,
    ProposalActionsItem,
} from './proposalActionsItem';

describe('<ProposalActionsItem /> component', () => {
    beforeAll(() => {
        initUpdateMetadataActionViews();
    });

    const createTestComponent = (
        props?: Partial<IProposalActionsItemProps>,
    ) => {
        const completeProps: IProposalActionsItemProps = {
            action: generateProposalActionUpdateMetadata(),
            daoId: 'dao-id',
            chainId: 11_155_111,
            ...props,
        };

        return (
            <GukModulesProvider>
                <ProposalActions.Root actionsCount={1}>
                    <ProposalActions.Container emptyStateDescription="">
                        <ProposalActionsItem {...completeProps} />
                    </ProposalActions.Container>
                </ProposalActions.Root>
            </GukModulesProvider>
        );
    };

    const copyKey = (key: string) =>
        `app.actions.core.updateMetadataActionDetails.${key}`;

    // Metadata actions are matched by type, so they carry no decoded input data and a valid target address.
    const target = { to: '0xa0Ab554dEa45be64F12E3B0085DDC59852eFF9fc' };

    it('renders the registered metadata view for DAO metadata update actions', async () => {
        const action = generateProposalActionUpdateMetadata({
            ...target,
            proposedMetadata: {
                name: 'Proposed DAO',
                description: 'Proposed description',
                links: [{ name: 'Website', url: 'https://dao.com' }],
            },
            existingMetadata: {
                name: 'Existing DAO',
                description: 'Existing description',
                links: [],
            },
        });

        render(createTestComponent({ action }));
        await userEvent.click(screen.getAllByRole('button')[0]);

        expect(screen.getByText(copyKey('logoTerm'))).toBeInTheDocument();
        expect(screen.getByText('Proposed DAO')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Website/ })).toHaveAttribute(
            'href',
            'https://dao.com',
        );

        await userEvent.click(screen.getByText(copyKey('existingToggle')));

        expect(screen.getByText('Existing DAO')).toBeInTheDocument();
    });

    it('renders the registered metadata view for plugin metadata update actions', async () => {
        const action = generateProposalActionUpdatePluginMetadata({
            ...target,
            proposedMetadata: { name: 'Council', processKey: 'CNL' },
            existingMetadata: { name: 'Council', processKey: 'CNC' },
        });

        render(createTestComponent({ action }));
        await userEvent.click(screen.getAllByRole('button')[0]);

        expect(screen.queryByText(copyKey('logoTerm'))).not.toBeInTheDocument();
        expect(screen.getByText(copyKey('summaryTerm'))).toBeInTheDocument();
        expect(screen.getByText('CNL')).toBeInTheDocument();
    });
});

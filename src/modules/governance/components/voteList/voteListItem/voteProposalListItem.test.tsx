import { generateProposal, generateVote } from '@/modules/governance/testUtils';
import { DateFormat, formatterUtils } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { type IVoteProposalListItemProps, VoteProposalListItem } from './voteProposalListItem';

describe('<VoteProposalListItem /> component', () => {
    const createTestComponent = (props?: Partial<IVoteProposalListItemProps>) => {
        const completeProps = {
            vote: generateVote(),
            daoId: 'dao-test',
            voteIndicator: 'approve' as const,
            ...props,
        };

        return <VoteProposalListItem {...completeProps} />;
    };

    it('renders the parent proposal info when parentProposal is defined', () => {
        const vote = generateVote({
            parentProposal: { id: 'parent-id', title: 'Parent Proposal' },
            proposal: generateProposal({ id: 'child-id', title: 'Child Proposal' }),
        });
        const daoId = 'dao-test';

        render(createTestComponent({ vote, daoId }));

        expect(screen.getByText('Parent Proposal')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', `/dao/${daoId}/proposals/parent-id`);
    });

    it('renders the child proposal info when parentProposal is not defined', () => {
        const vote = generateVote({
            proposal: generateProposal({ id: 'child-id', title: 'Child Proposal' }),
        });
        const daoId = 'dao-test';

        render(createTestComponent({ vote, daoId }));

        expect(screen.getByText('Child Proposal')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', `/dao/${daoId}/proposals/child-id`);
    });

    it('renders the correct timestamp as a date', () => {
        const blockTimestamp = 1672531200;
        const vote = generateVote({
            proposal: generateProposal({ title: 'Proposal with Date' }),
            blockTimestamp,
        });
        const daoId = 'dao-test';

        render(createTestComponent({ vote, daoId }));

        const expectedDate = formatterUtils.formatDate(blockTimestamp * 1000, { format: DateFormat.DURATION });
        expect(screen.getByText(`${expectedDate!} ago`)).toBeInTheDocument();
    });

    it('renders all fallback data correctly when parentProposal and timestamp are missing', () => {
        const vote = generateVote({
            proposal: generateProposal({ id: 'fallback-id', title: 'Fallback Proposal' }),
        });
        const daoId = 'dao-fallback';

        render(createTestComponent({ vote, daoId }));

        expect(screen.getByText('Fallback Proposal')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', `/dao/${daoId}/proposals/fallback-id`);
    });

    it('renders the correct vote indicator', () => {
        const vote = generateVote({
            proposal: generateProposal({ id: 'child-id', title: 'Child Proposal' }),
        });
        const daoId = 'dao-test';
        const voteIndicator = 'yes';

        render(createTestComponent({ vote, daoId, voteIndicator }));

        expect(screen.getByText(voteIndicator)).toBeInTheDocument();
    });
});

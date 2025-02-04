import { generateProposal, generateVote } from '@/modules/governance/testUtils';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { DateFormat, formatterUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { type IVoteProposalListItemProps, VoteProposalListItem } from './voteProposalListItem';

describe('<VoteProposalListItem /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: generateDaoPlugin() })]);
    });

    afterEach(() => {
        useDaoPluginsSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IVoteProposalListItemProps>) => {
        const completeProps = {
            vote: generateVote(),
            daoId: 'dao-test',
            voteIndicator: 'approve' as const,
            ...props,
        };

        return (
            <GukModulesProvider>
                <VoteProposalListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the parent proposal info when parentProposal is defined', () => {
        const vote = generateVote({
            parentProposal: { id: 'parent-id', title: 'Parent Proposal', incrementalId: 3, pluginAddress: '0x123' },
            proposal: generateProposal({ title: 'Child Proposal' }),
        });
        const daoId = 'dao-test';

        const plugin = generateDaoPlugin({ slug: 'parent-slug' });
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ id: 'test-plugin', meta: plugin })]);

        render(createTestComponent({ vote, daoId }));

        expect(screen.getByText('Parent Proposal')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', `/dao/${daoId}/proposals/PARENT-SLUG-3`);
    });

    it('renders the child proposal info when parentProposal is not defined', () => {
        const vote = generateVote({
            proposal: generateProposal({ title: 'Child Proposal', incrementalId: 4 }),
        });
        const daoId = 'dao-test';

        const plugin = generateDaoPlugin({ slug: 'child-slug' });
        useDaoPluginsSpy.mockReturnValue([generateTabComponentPlugin({ meta: plugin })]);

        render(createTestComponent({ vote, daoId }));

        expect(screen.getByText('Child Proposal')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', `/dao/${daoId}/proposals/CHILD-SLUG-4`);
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

    it('renders the correct vote indicator', () => {
        const vote = generateVote({
            proposal: generateProposal({ title: 'Child Proposal' }),
        });
        const daoId = 'dao-test';
        const voteIndicator = 'yes';

        render(createTestComponent({ vote, daoId, voteIndicator }));

        expect(screen.getByText(voteIndicator)).toBeInTheDocument();
    });
});

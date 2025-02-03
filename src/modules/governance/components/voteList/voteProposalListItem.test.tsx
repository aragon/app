import { generateProposal, generateVote } from '@/modules/governance/testUtils';
import * as useDaoPlugins from '@/shared/hooks/useDaoPlugins';
import { generateDaoPlugin, generateTabComponentPlugin } from '@/shared/testUtils';
import { DateFormat, formatterUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { type IVoteProposalListItemProps, VoteProposalListItem } from './voteProposalListItem';

describe('<VoteProposalListItem /> component', () => {
    const useDaoPluginsSpy = jest.spyOn(useDaoPlugins, 'useDaoPlugins');

    beforeEach(() => {
        useDaoPluginsSpy.mockReturnValue([
            generateTabComponentPlugin({ id: 'test-id', meta: generateDaoPlugin({ address: '0x123' }) }),
        ]);
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
            parentProposal: { id: 'parent-id', title: 'Parent Proposal', incrementalId: 1, pluginAddress: '0x123' },
            proposal: generateProposal({
                title: 'Child Proposal',
                incrementalId: 2,
                pluginAddress: '0x123',
            }),
        });
        const daoId = 'dao-test';

        render(createTestComponent({ vote, daoId }));

        expect(screen.getByText('Parent Proposal')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', `/dao/${daoId}/proposals/SLUG-1`);
    });

    it('renders the child proposal info when parentProposal is not defined', () => {
        const vote = generateVote({
            proposal: generateProposal({
                title: 'Child Proposal',
                incrementalId: 1,
                pluginAddress: '0x123',
            }),
        });
        const daoId = 'dao-test';

        render(createTestComponent({ vote, daoId }));

        expect(screen.getByText('Child Proposal')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', `/dao/${daoId}/proposals/SLUG-1`);
    });

    it('renders the correct timestamp as a date', () => {
        const blockTimestamp = 1672531200;
        const vote = generateVote({
            proposal: generateProposal({ title: 'Proposal with Date', incrementalId: 1, pluginAddress: '0x123' }),
            blockTimestamp,
        });
        const daoId = 'dao-test';

        render(createTestComponent({ vote, daoId }));

        const expectedDate = formatterUtils.formatDate(blockTimestamp * 1000, { format: DateFormat.DURATION });
        expect(screen.getByText(`${expectedDate!} ago`)).toBeInTheDocument();
    });

    it('renders the correct vote indicator', () => {
        const vote = generateVote({
            proposal: generateProposal({
                title: 'Child Proposal',
                pluginAddress: '0x123',
                incrementalId: 2,
            }),
        });
        const daoId = 'dao-test';
        const voteIndicator = 'yes';

        render(createTestComponent({ vote, daoId, voteIndicator }));

        expect(screen.getByText(voteIndicator)).toBeInTheDocument();
    });
});

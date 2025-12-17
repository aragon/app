import { DateFormat, formatterUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateProposal, generateVote } from '@/modules/governance/testUtils';
import * as daoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import { proposalUtils } from '../../utils/proposalUtils';
import { type IVoteProposalListItemProps, VoteProposalListItem } from './voteProposalListItem';

describe('<VoteProposalListItem /> component', () => {
    const getDaoUrlSpy = jest.spyOn(daoUtils, 'getDaoUrl');
    const getProposalSlugSpy = jest.spyOn(proposalUtils, 'getProposalSlug');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        getProposalSlugSpy.mockReturnValue('admin-1');
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        getProposalSlugSpy.mockReset();
        getDaoUrlSpy.mockReset();
        useDaoSpy.mockReset();
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

    it('renders the parent proposal info when parent proposal is defined', () => {
        const parentProposal = generateProposal({ title: 'Parent Proposal' });
        const vote = generateVote({
            parentProposal,
            proposal: generateProposal(),
        });
        const dao = generateDao();
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent({ vote }));
        expect(getProposalSlugSpy).toHaveBeenCalledWith(parentProposal, dao);
        expect(screen.getByText(parentProposal.title)).toBeInTheDocument();
    });

    it('renders the child proposal info when parent proposal is not defined', () => {
        const proposal = generateProposal({ title: 'Proposal' });
        const vote = generateVote({ proposal, parentProposal: undefined });
        const dao = generateDao();
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent({ vote }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
        expect(getProposalSlugSpy).toHaveBeenCalledWith(proposal, dao);
    });

    it('correctly renders the vote timestamp', () => {
        const blockTimestamp = 1_672_531_200;
        const vote = generateVote({
            blockTimestamp,
            proposal: generateProposal(),
        });
        render(createTestComponent({ vote }));
        const expectedDate = formatterUtils.formatDate(blockTimestamp * 1000, {
            format: DateFormat.DURATION,
        });
        expect(screen.getByText(`${expectedDate!} ago`)).toBeInTheDocument();
    });

    it('renders the correct vote indicator', () => {
        const vote = generateVote({ proposal: generateProposal() });
        const voteIndicator = 'yes';
        render(createTestComponent({ vote, voteIndicator }));
        expect(screen.getByText(voteIndicator)).toBeInTheDocument();
    });
});

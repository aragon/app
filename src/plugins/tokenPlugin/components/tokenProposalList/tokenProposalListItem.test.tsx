import * as useUserVote from '@/modules/governance/hooks/useUserVote';
import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateTokenProposal, generateTokenVote } from '../../testUtils';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import { type ITokenProposalListItemProps, TokenProposalListItem } from './tokenProposalListItem';
import { generateDaoPlugin } from '@/shared/testUtils';

describe('<TokenProposalListItem /> component', () => {
    const getProposalStatusSpy = jest.spyOn(tokenProposalUtils, 'getProposalStatus');
    const useUserVoteSpy = jest.spyOn(useUserVote, 'useUserVote');

    beforeEach(() => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACCEPTED);
        useUserVoteSpy.mockReturnValue(generateTokenVote());
    });

    afterEach(() => {
        getProposalStatusSpy.mockReset();
        useUserVoteSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenProposalListItemProps>) => {
        const completeProps: ITokenProposalListItemProps = {
            proposal: generateTokenProposal(),
            daoId: 'dao-id',
            plugin: generateDaoPlugin(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenProposalListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the token proposal', () => {
        const plugin = generateDaoPlugin({ slug: 'tokenvoting' });
        const proposal = generateTokenProposal({ title: 'my-proposal' });
        render(createTestComponent({ proposal, plugin }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const plugin = generateDaoPlugin({ slug: 'tokenvoting' });
        const proposal = generateTokenProposal({ incrementalId: 3 });
        const daoId = 'dao-id';
        render(createTestComponent({ proposal, plugin }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/tokenvoting-3`);
    });
});

import * as useUserVote from '@/modules/governance/hooks/useUserVote';
import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateTokenPluginSettings, generateTokenProposal, generateTokenVote } from '../../testUtils';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import { type ITokenProposalListItemProps, TokenProposalListItem } from './tokenProposalListItem';

describe('<TokenProposalListItem /> component', () => {
    const getTotalVotesSpy = jest.spyOn(tokenProposalUtils, 'getTotalVotes');
    const getProposalStatusSpy = jest.spyOn(tokenProposalUtils, 'getProposalStatus');
    const useUserVoteSpy = jest.spyOn(useUserVote, 'useUserVote');

    beforeEach(() => {
        useUserVoteSpy.mockReturnValue(generateTokenVote());
    });

    afterEach(() => {
        getTotalVotesSpy.mockReset();
        getProposalStatusSpy.mockReset();
        useUserVoteSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenProposalListItemProps>) => {
        const completeProps: ITokenProposalListItemProps = {
            proposal: generateTokenProposal(),
            daoId: 'dao-id',
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenProposalListItem {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the token proposal', () => {
        const proposal = generateTokenProposal({
            settings: generateTokenPluginSettings({ historicalTotalSupply: '0' }),
        });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const proposal = generateTokenProposal({ id: 'proposal-id' });
        const daoId = 'dao-id';
        render(createTestComponent({ proposal }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(`/dao/${daoId}/proposals/${proposal.id}`);
    });
});

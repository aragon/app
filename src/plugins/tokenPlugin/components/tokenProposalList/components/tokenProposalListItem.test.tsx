import * as useUserVote from '@/modules/governance/hooks/useUserVote';
import { generateTokenProposal, generateTokenVote } from '@/plugins/tokenPlugin/testUtils';
import { tokenProposalUtils } from '@/plugins/tokenPlugin/utils/tokenProposalUtils';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import { generateDao, generateDaoPlugin, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { GukModulesProvider, ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { type ITokenProposalListItemProps, TokenProposalListItem } from './tokenProposalListItem';

describe('<TokenProposalListItem /> component', () => {
    const getProposalStatusSpy = jest.spyOn(tokenProposalUtils, 'getProposalStatus');
    const useUserVoteSpy = jest.spyOn(useUserVote, 'useUserVote');
    const useDaoSpy = jest.spyOn(daoService, 'useDao');

    beforeEach(() => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACCEPTED);
        useUserVoteSpy.mockReturnValue(generateTokenVote());
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        getProposalStatusSpy.mockReset();
        useUserVoteSpy.mockReset();
        useDaoSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenProposalListItemProps>) => {
        const completeProps: ITokenProposalListItemProps = {
            proposal: generateTokenProposal(),
            daoId: 'test-dao-id',
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
        const proposal = generateTokenProposal({ title: 'my-proposal' });
        render(createTestComponent({ proposal }));
        expect(screen.getByText(proposal.title)).toBeInTheDocument();
    });

    it('sets the correct link for proposal page', () => {
        const plugin = generateDaoPlugin({ slug: 'tokenvoting' });
        const proposal = generateTokenProposal({ incrementalId: 3 });
        const daoAddress = '0x123';
        const daoNetwork = Network.ETHEREUM_SEPOLIA;
        const dao = generateDao({ address: daoAddress, network: daoNetwork });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent({ proposal, plugin }));
        expect(screen.getAllByRole('link')[0].getAttribute('href')).toEqual(
            `/dao/${daoNetwork}/${daoAddress}/proposals/TOKENVOTING-3`,
        );
    });
});

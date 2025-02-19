import { ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { generateTokenPluginSettings, generateTokenPluginSettingsToken, generateTokenProposal } from '../../testUtils';
import { VoteOption } from '../../types/enum/voteOption';
import { TokenProposalVotingBreakdown, type ITokenProposalVotingBreakdownProps } from './tokenProposalVotingBreakdown';

describe('<TokenProposalVotingBreakdown /> component', () => {
    const createTestComponent = (props?: Partial<ITokenProposalVotingBreakdownProps>) => {
        const baseProposal = generateTokenProposal({
            settings: generateTokenPluginSettings({
                token: generateTokenPluginSettingsToken(),
                historicalTotalSupply: '1',
            }),
        });
        const completeProps: ITokenProposalVotingBreakdownProps = {
            proposal: baseProposal,
            ...props,
        };

        return (
            <Tabs.Root defaultValue={ProposalVotingTab.BREAKDOWN}>
                <TokenProposalVotingBreakdown {...completeProps} />
            </Tabs.Root>
        );
    };

    it('correctly displays the breakdown of the token proposal', () => {
        const settings = generateTokenPluginSettings({
            minParticipation: 200000,
            supportThreshold: 500000,
            historicalTotalSupply: '1000000',
            token: generateTokenPluginSettingsToken({ decimals: 1, symbol: 'TTT' }),
        });
        const votesByOption = [
            { type: VoteOption.YES, totalVotingPower: '7500' },
            { type: VoteOption.NO, totalVotingPower: '2500' },
        ];
        const proposal = generateTokenProposal({ settings, metrics: { votesByOption } });
        render(createTestComponent({ proposal }));
        expect(screen.getByRole('tabpanel')).toBeInTheDocument();

        expect(screen.getAllByRole('progressbar')[0].dataset.value).toEqual('75');
        expect(screen.getAllByText('750')).toHaveLength(2);

        expect(screen.getAllByRole('progressbar')[1].dataset.value).toEqual('1');
        expect(screen.getByText('0')).toBeInTheDocument();

        expect(screen.getAllByRole('progressbar')[2].dataset.value).toEqual('25');
        expect(screen.getByText('250')).toBeInTheDocument();

        expect(screen.getByText('75%')).toBeInTheDocument(); // support
        expect(screen.getByText('5%')).toBeInTheDocument(); // minimum participation
    });
});

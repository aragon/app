import { ProposalVotingTab, Tabs } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { VoteOption } from '../../../tokenPlugin/types';
import { generateLockToVotePluginSettings } from '../../testUtils/generators/lockToVotePluginSettings';
import { generateLockToVotePluginSettingsToken } from '../../testUtils/generators/lockToVotePluginSettingsToken';
import { generateLockToVoteProposal } from '../../testUtils/generators/lockToVoteProposal';
import { type ILockToVoteProposalVotingBreakdownProps, LockToVoteProposalVotingBreakdown } from './lockToVoteProposalVotingBreakdown';

describe('<LockToVoteProposalVotingBreakdown /> component', () => {
    const createTestComponent = (props?: Partial<ILockToVoteProposalVotingBreakdownProps>) => {
        const baseProposal = generateLockToVoteProposal({
            settings: generateLockToVotePluginSettings({
                token: generateLockToVotePluginSettingsToken({
                    totalSupply: '1',
                }),
            }),
        });
        const completeProps: ILockToVoteProposalVotingBreakdownProps = {
            proposal: baseProposal,
            ...props,
        };

        return (
            <Tabs.Root defaultValue={ProposalVotingTab.BREAKDOWN}>
                <LockToVoteProposalVotingBreakdown {...completeProps} />
            </Tabs.Root>
        );
    };

    it('correctly displays the breakdown of the token proposal', () => {
        const settings = generateLockToVotePluginSettings({
            minParticipation: 200_000,
            supportThreshold: 500_000,
            token: generateLockToVotePluginSettingsToken({ decimals: 1, symbol: 'TTT', totalSupply: '1000000' }),
        });
        const votesByOption = [
            { type: VoteOption.YES, totalVotingPower: '7500' },
            { type: VoteOption.NO, totalVotingPower: '2500' },
        ];
        const proposal = generateLockToVoteProposal({ settings, metrics: { votesByOption } });
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

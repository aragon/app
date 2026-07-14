import { ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    generateTokenPluginSettings,
    generateTokenPluginSettingsToken,
    generateTokenProposal,
} from '../../testUtils';
import { type ITokenProposal, VoteOption } from '../../types';
import { tokenProposalUtils } from '../../utils/tokenProposalUtils';
import {
    type ITokenProposalVotingSummaryProps,
    TokenProposalVotingSummary,
} from './tokenProposalVotingSummary';

describe('<TokenProposalVotingSummary /> component', () => {
    const getProposalStatusSpy = jest.spyOn(
        tokenProposalUtils,
        'getProposalStatus',
    );

    afterEach(() => {
        getProposalStatusSpy.mockReset();
    });

    // supportThreshold 500_000 = 50% (ratio base 1_000_000), token decimals 1,
    // raw amounts are formatted with the token decimals by the component.
    const generateTestProposal = (
        votesByOption: Array<{ type: VoteOption; totalVotingPower: string }>,
        settings?: Partial<ITokenProposal['settings']>,
    ) =>
        generateTokenProposal({
            settings: generateTokenPluginSettings({
                supportThreshold: 500_000,
                minParticipation: 0,
                historicalTotalSupply: '1000000',
                token: generateTokenPluginSettingsToken({
                    decimals: 1,
                    symbol: 'TTT',
                }),
                ...settings,
            }),
            metrics: { votesByOption },
        });

    const createTestComponent = (
        props?: Partial<ITokenProposalVotingSummaryProps>,
    ) => {
        const completeProps: ITokenProposalVotingSummaryProps = {
            proposal: generateTestProposal([]),
            name: 'Token Voting',
            isVeto: false,
            ...props,
        };

        return <TokenProposalVotingSummary {...completeProps} />;
    };

    it('renders only the plugin name when no proposal is set', () => {
        render(createTestComponent({ proposal: undefined }));
        expect(screen.getByText('Token Voting')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays the yes votes over yes+no votes as support, excluding abstain votes', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal([
            { type: VoteOption.YES, totalVotingPower: '7500' },
            { type: VoteOption.NO, totalVotingPower: '2500' },
            { type: VoteOption.ABSTAIN, totalVotingPower: '5000' },
        ]);
        render(createTestComponent({ proposal }));

        // CORRECT calculation: 750 / (750 + 250) = 75%
        // WRONG: winning-option / all-votes (750 / 1500 = 50%)
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('75');
        expect(screen.getByTestId('progress-indicator').dataset.value).toEqual(
            '50',
        );
        // Support is above the threshold => reached (primary) variant
        expect(progressbar.querySelector('.bg-primary-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-neutral-400')).toBeNull();
        expect(
            screen.getByText(
                'app.plugins.token.tokenProposalVotingSummary.supportLabel',
            ),
        ).toBeInTheDocument();
        // Votes description total is yes+no (1K), not yes+no+abstain (1.5K)
        expect(screen.getByText('750')).toBeInTheDocument();
        expect(
            screen.getByText(
                'app.plugins.token.tokenProposalVotingSummary.votesDescription (details=1K TTT)',
            ),
        ).toBeInTheDocument();
    });

    it('displays yes-vote support as not reached for veto proposals with majority no votes', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal([
            { type: VoteOption.YES, totalVotingPower: '1000' },
            { type: VoteOption.NO, totalVotingPower: '9000' },
        ]);
        render(createTestComponent({ proposal, isVeto: true }));

        // Veto support is the yes votes (10%), not the winning no option (90%)
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('10');
        // Support must not be marked as reached
        expect(progressbar.querySelector('.bg-neutral-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-primary-400')).toBeNull();
        expect(
            screen.getByText(
                'app.plugins.token.tokenProposalVotingSummary.optimisticSupportLabel',
            ),
        ).toBeInTheDocument();
    });

    it('displays support at exactly the threshold as not reached', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal([
            { type: VoteOption.YES, totalVotingPower: '5000' },
            { type: VoteOption.NO, totalVotingPower: '5000' },
        ]);
        render(createTestComponent({ proposal }));

        // On-chain support check is strictly greater than the threshold
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('50');
        expect(screen.getByTestId('progress-indicator').dataset.value).toEqual(
            '50',
        );
        expect(progressbar.querySelector('.bg-neutral-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-primary-400')).toBeNull();
    });

    it('displays zero support without the reached variant when only abstain votes are cast', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal([
            { type: VoteOption.ABSTAIN, totalVotingPower: '5000' },
        ]);
        render(createTestComponent({ proposal }));

        // No countable votes => 0% support, not abstain-as-winning-option (100%).
        // Progress clamps the rendered value to a minimum of 1.
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('1');
        expect(progressbar.querySelector('.bg-neutral-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-primary-400')).toBeNull();
        expect(
            screen.getByText(
                'app.plugins.token.tokenProposalVotingSummary.votesDescription (details=0 TTT)',
            ),
        ).toBeInTheDocument();
    });

    it('displays veto support as reached for veto proposals when yes votes exceed the threshold', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal([
            { type: VoteOption.YES, totalVotingPower: '7500' },
            { type: VoteOption.NO, totalVotingPower: '2500' },
            { type: VoteOption.ABSTAIN, totalVotingPower: '5000' },
        ]);
        render(createTestComponent({ proposal, isVeto: true }));

        // Veto support is yes / (yes + no) = 75% > 50% => reached (primary) variant
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('75');
        expect(progressbar.querySelector('.bg-primary-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-neutral-400')).toBeNull();
        expect(
            screen.getByText(
                'app.plugins.token.tokenProposalVotingSummary.optimisticSupportLabel',
            ),
        ).toBeInTheDocument();
    });

    it('displays the approved status when proposal is executed and approval is reached', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.EXECUTED);
        const proposal = generateTestProposal(
            [
                { type: VoteOption.YES, totalVotingPower: '7500' },
                { type: VoteOption.NO, totalVotingPower: '2500' },
            ],
            { minParticipation: 200_000, historicalTotalSupply: '10000' },
        );
        render(createTestComponent({ proposal, isExecuted: true }));

        const status = screen.getByText(
            'app.plugins.token.tokenProposalVotingSummary.approved',
        );
        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('text-success-800');
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays the vetoed status when veto proposal has failed and approval is reached', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.FAILED);
        const proposal = generateTestProposal(
            [
                { type: VoteOption.YES, totalVotingPower: '7500' },
                { type: VoteOption.NO, totalVotingPower: '2500' },
            ],
            { minParticipation: 200_000, historicalTotalSupply: '10000' },
        );
        render(createTestComponent({ proposal, isVeto: true }));

        const status = screen.getByText(
            'app.plugins.token.tokenProposalVotingSummary.vetoed',
        );
        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('text-critical-800');
    });

    it('displays the not-approved status when proposal has failed and support is not reached', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.FAILED);
        const proposal = generateTestProposal(
            [{ type: VoteOption.NO, totalVotingPower: '2500' }],
            { minParticipation: 200_000, historicalTotalSupply: '10000' },
        );
        render(createTestComponent({ proposal }));

        const status = screen.getByText(
            'app.plugins.token.tokenProposalVotingSummary.notApproved',
        );
        expect(status).toBeInTheDocument();
        expect(status).toHaveClass('text-neutral-500');
    });

    it('displays the not-vetoed status when veto proposal is executed and support is not reached', () => {
        const proposal = generateTestProposal(
            [{ type: VoteOption.NO, totalVotingPower: '2500' }],
            { minParticipation: 200_000, historicalTotalSupply: '10000' },
        );
        render(
            createTestComponent({ proposal, isVeto: true, isExecuted: true }),
        );

        expect(
            screen.getByText(
                'app.plugins.token.tokenProposalVotingSummary.notVetoed',
            ),
        ).toBeInTheDocument();
    });
});

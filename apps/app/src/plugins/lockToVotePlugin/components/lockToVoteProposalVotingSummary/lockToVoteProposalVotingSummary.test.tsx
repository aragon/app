import { ProposalStatus } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { VoteOption } from '../../../tokenPlugin/types';
import { generateLockToVotePluginSettings } from '../../testUtils/generators/lockToVotePluginSettings';
import { generateLockToVotePluginSettingsToken } from '../../testUtils/generators/lockToVotePluginSettingsToken';
import { generateLockToVoteProposal } from '../../testUtils/generators/lockToVoteProposal';
import { lockToVoteProposalUtils } from '../../utils/lockToVoteProposalUtils';
import {
    type ILockToVoteProposalVotingSummaryProps,
    LockToVoteProposalVotingSummary,
} from './lockToVoteProposalVotingSummary';

describe('<LockToVoteProposalVotingSummary /> component', () => {
    const getProposalStatusSpy = jest.spyOn(
        lockToVoteProposalUtils,
        'getProposalStatus',
    );

    afterEach(() => {
        getProposalStatusSpy.mockReset();
    });

    const tokenAddress = '0xToken';
    const translationPrefix =
        'app.plugins.lockToVote.lockToVoteProposalVotingSummary';

    const generateTestProposal = (params: {
        yes?: string;
        no?: string;
        abstain?: string;
        minParticipation?: number;
        totalSupply?: string;
    }) => {
        const {
            yes = '0',
            no = '0',
            abstain,
            minParticipation = 0,
            totalSupply = '1000000',
        } = params;

        const votesByOption = [
            { type: VoteOption.YES, totalVotingPower: yes },
            { type: VoteOption.NO, totalVotingPower: no },
        ];

        if (abstain != null) {
            votesByOption.push({
                type: VoteOption.ABSTAIN,
                totalVotingPower: abstain,
            });
        }

        return generateLockToVoteProposal({
            settings: generateLockToVotePluginSettings({
                minParticipation,
                supportThreshold: 500_000,
                token: generateLockToVotePluginSettingsToken({
                    address: tokenAddress,
                    decimals: 1,
                    symbol: 'TTT',
                }),
            }),
            metrics: { votesByOption },
            tokensTotalSupply: { [tokenAddress.toLowerCase()]: totalSupply },
        });
    };

    const createTestComponent = (
        props?: Partial<ILockToVoteProposalVotingSummaryProps>,
    ) => {
        const completeProps: ILockToVoteProposalVotingSummaryProps = {
            name: 'Lock to vote',
            isVeto: false,
            ...props,
        };

        return <LockToVoteProposalVotingSummary {...completeProps} />;
    };

    it('renders only the plugin name when no proposal is set', () => {
        render(createTestComponent({ name: 'My plugin', proposal: undefined }));
        expect(screen.getByText('My plugin')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays the yes votes over yes+no votes as support, excluding abstain votes', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal({
            yes: '7500',
            no: '2500',
            abstain: '5000',
        });
        render(createTestComponent({ proposal }));

        // Support is yes / (yes + no) = 75%, not winning-option / (yes + no + abstain) = 50%
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('75');

        // Votes description uses the yes + no total (10000 raw -> 1K), not yes + no + abstain (1.5K)
        expect(screen.getByText('750')).toBeInTheDocument();
        expect(
            screen.getByText(
                `${translationPrefix}.votesDescription (details=1K TTT)`,
            ),
        ).toBeInTheDocument();

        expect(
            screen.getByText(`${translationPrefix}.supportLabel`),
        ).toBeInTheDocument();
        expect(screen.getByTestId('progress-indicator').dataset.value).toEqual(
            '50',
        );

        // 75% > 50% support threshold => reached (primary) variant
        expect(progressbar.querySelector('.bg-primary-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-neutral-400')).toBeNull();
    });

    it('displays yes-vote support as not reached for veto proposals with majority no votes', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal({ yes: '1000', no: '9000' });
        render(createTestComponent({ proposal, isVeto: true }));

        expect(
            screen.getByText(`${translationPrefix}.optimisticSupportLabel`),
        ).toBeInTheDocument();

        // Veto support is yes / (yes + no) = 10%, not the winning no option (90%)
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('10');

        // 10% < 50% support threshold => not-reached (neutral) variant
        expect(progressbar.querySelector('.bg-neutral-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-primary-400')).toBeNull();
    });

    it('displays support at exactly the threshold as not reached', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal({ yes: '5000', no: '5000' });
        render(createTestComponent({ proposal }));

        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('50');
        expect(screen.getByTestId('progress-indicator').dataset.value).toEqual(
            '50',
        );

        // On-chain semantics are strictly greater-than: 50% support does not reach a 50% threshold
        expect(progressbar.querySelector('.bg-neutral-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-primary-400')).toBeNull();
    });

    it('displays zero support without the reached variant when only abstain votes are cast', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal({ abstain: '5000' });
        render(createTestComponent({ proposal }));

        // No countable votes => 0% support, not abstain-as-winning-option (100%).
        // Progress clamps the rendered value to a minimum of 1.
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('1');
        expect(progressbar.querySelector('.bg-neutral-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-primary-400')).toBeNull();
        expect(
            screen.getByText(
                `${translationPrefix}.votesDescription (details=0 TTT)`,
            ),
        ).toBeInTheDocument();
    });

    it('displays veto support as reached for veto proposals when yes votes exceed the threshold', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal({
            yes: '7500',
            no: '2500',
            abstain: '5000',
        });
        render(createTestComponent({ proposal, isVeto: true }));

        // Veto support is yes / (yes + no) = 75% > 50% => reached (primary) variant
        const progressbar = screen.getByRole('progressbar');
        expect(progressbar.dataset.value).toEqual('75');
        expect(progressbar.querySelector('.bg-primary-400')).not.toBeNull();
        expect(progressbar.querySelector('.bg-neutral-400')).toBeNull();
        expect(
            screen.getByText(`${translationPrefix}.optimisticSupportLabel`),
        ).toBeInTheDocument();
    });

    it('displays the approved status when proposal is executed and approval is reached', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal({
            yes: '7500',
            no: '2500',
            minParticipation: 200_000,
            totalSupply: '10000',
        });
        render(createTestComponent({ proposal, isExecuted: true }));

        const statusText = screen.getByText(`${translationPrefix}.approved`);
        expect(statusText).toHaveClass('text-success-800');
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays the vetoed status when veto proposal is executed and approval is reached', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.ACTIVE);
        const proposal = generateTestProposal({
            yes: '7500',
            no: '2500',
            minParticipation: 200_000,
            totalSupply: '10000',
        });
        render(
            createTestComponent({ proposal, isExecuted: true, isVeto: true }),
        );

        const statusText = screen.getByText(`${translationPrefix}.vetoed`);
        expect(statusText).toHaveClass('text-critical-800');
    });

    it('displays the not-approved status when proposal has failed and support is not reached', () => {
        getProposalStatusSpy.mockReturnValue(ProposalStatus.FAILED);
        const proposal = generateTestProposal({
            yes: '0',
            no: '2500',
            minParticipation: 200_000,
            totalSupply: '10000',
        });
        render(createTestComponent({ proposal }));

        const statusText = screen.getByText(`${translationPrefix}.notApproved`);
        expect(statusText).toHaveClass('text-neutral-500');
    });

    it('displays the not-vetoed status when veto proposal is executed and support is not reached', () => {
        const proposal = generateTestProposal({
            yes: '0',
            no: '2500',
            minParticipation: 200_000,
            totalSupply: '10000',
        });
        render(
            createTestComponent({ proposal, isVeto: true, isExecuted: true }),
        );

        const statusText = screen.getByText(`${translationPrefix}.notVetoed`);
        expect(statusText).toHaveClass('text-neutral-500');
    });
});

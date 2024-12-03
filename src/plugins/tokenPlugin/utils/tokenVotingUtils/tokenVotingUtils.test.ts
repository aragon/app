import { generateToken } from '@/modules/finance/testUtils';
import { generateTokenProposal } from '../../testUtils';
import { type ITokenProposal, type ITokenProposalOptionVotes, VoteOption } from '../../types';
import { generateTokenPluginSettings } from './../../testUtils/generators/tokenPluginSettings';
import { tokenVotingUtils } from './tokenVotingUtils';

describe('tokenVotingUtils', () => {
    describe('getOptionVotingPower', () => {
        it('returns the correctly formatted voting power when the option exists', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [
                { type: VoteOption.YES, totalVotingPower: '1000000000000000000' },
                { type: VoteOption.NO, totalVotingPower: '2000000000000000000' },
            ];
            const proposal: ITokenProposal = generateTokenProposal({
                settings: generateTokenPluginSettings({ token: generateToken({ decimals: 18 }) }),
                metrics: { votesByOption },
            });

            const yesVotingPower = tokenVotingUtils.getOptionVotingPower(proposal, VoteOption.YES);
            const noVotingPower = tokenVotingUtils.getOptionVotingPower(proposal, VoteOption.NO);

            expect(yesVotingPower).toEqual('1');
            expect(noVotingPower).toEqual('2');
        });

        it('returns 0 when the option does not exist', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [
                { type: VoteOption.YES, totalVotingPower: '1000000000000000000' },
            ];
            const proposal: ITokenProposal = generateTokenProposal({
                settings: generateTokenPluginSettings({ token: generateToken({ decimals: 18 }) }),
                metrics: { votesByOption },
            });

            const noVotingPower = tokenVotingUtils.getOptionVotingPower(proposal, VoteOption.NO);

            expect(noVotingPower).toEqual('0');
        });

        it('handles different decimals correctly', () => {
            const votesByOption: ITokenProposalOptionVotes[] = [
                { type: VoteOption.YES, totalVotingPower: '1000000' },
                { type: VoteOption.NO, totalVotingPower: '2500000' },
            ];
            const proposal: ITokenProposal = generateTokenProposal({
                settings: generateTokenPluginSettings({ token: generateToken({ decimals: 6 }) }),
                metrics: { votesByOption },
            });

            const yesVotingPower = tokenVotingUtils.getOptionVotingPower(proposal, VoteOption.YES);
            const noVotingPower = tokenVotingUtils.getOptionVotingPower(proposal, VoteOption.NO);

            expect(yesVotingPower).toEqual('1');
            expect(noVotingPower).toEqual('2.5');
        });

        it('returns 0 when votesByOption is empty', () => {
            const proposal: ITokenProposal = generateTokenProposal({
                settings: generateTokenPluginSettings({ token: generateToken({ decimals: 18 }) }),
                metrics: { votesByOption: [] },
            });

            const yesVotingPower = tokenVotingUtils.getOptionVotingPower(proposal, VoteOption.YES);

            expect(yesVotingPower).toEqual('0');
        });
    });
});

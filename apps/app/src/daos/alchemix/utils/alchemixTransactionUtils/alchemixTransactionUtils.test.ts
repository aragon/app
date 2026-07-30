import * as Viem from 'viem';
import { alchemixTokenVotingAbi } from '../../constants';
import { alchemixTransactionUtils } from './alchemixTransactionUtils';

describe('alchemixTransaction utils', () => {
    const encodeFunctionDataSpy = jest.spyOn(Viem, 'encodeFunctionData');

    afterEach(() => {
        encodeFunctionDataSpy.mockReset();
    });

    describe('buildVoteData', () => {
        it('encodes an override-vote transaction when the vote type is override', () => {
            const proposalIndex = '3';
            const vote = { value: 2, voteType: 'override' as const };
            const transactionData = '0xdata' as const;
            encodeFunctionDataSpy.mockReturnValue(transactionData);

            const result = alchemixTransactionUtils.buildVoteData({
                proposalIndex,
                vote,
            });

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: alchemixTokenVotingAbi,
                functionName: 'overrideVote',
                args: [BigInt(proposalIndex), vote.value],
            });
            expect(result).toEqual(transactionData);
        });

        it('encodes a vote-and-override transaction when the vote type is voteAndOverride', () => {
            const proposalIndex = '4';
            const vote = { value: 3, voteType: 'voteAndOverride' as const };
            encodeFunctionDataSpy.mockReturnValue('0xdata');

            alchemixTransactionUtils.buildVoteData({ proposalIndex, vote });

            expect(encodeFunctionDataSpy).toHaveBeenCalledWith({
                abi: alchemixTokenVotingAbi,
                functionName: 'voteAndOverride',
                args: [BigInt(proposalIndex), vote.value],
            });
        });

        it('does not handle votes without an Alchemix vote type so that the plugin function is used', () => {
            const proposalIndex = '5';
            const vote = { value: 1 };

            const result = alchemixTransactionUtils.buildVoteData({
                proposalIndex,
                vote,
            });

            expect(encodeFunctionDataSpy).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });
});

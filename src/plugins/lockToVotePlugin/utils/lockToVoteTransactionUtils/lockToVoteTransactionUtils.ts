import type { IBuildVoteDataOption, IBuildVoteDataParams } from '@/modules/governance/types';
import { encodeFunctionData, type Hex } from 'viem';

interface ILockToVoteOption extends IBuildVoteDataOption {
    /**
     * Amount to be locked before voting.
     */
    lockAmount?: bigint;
    /**
     * Address of the voter.
     */
    voter: string;
}

export const lockManagerAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_voteOption', type: 'uint8' },
            { name: '_amount', type: 'uint256' },
        ],
        name: 'lockAndVote',
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

export const lockToVoteAbi = [
    {
        type: 'function',
        inputs: [
            { name: '_proposalId', type: 'uint256' },
            { name: '_voter', type: 'address' },
            { name: '_voteOption', type: 'uint8' },
            { name: '_newVotingPower', type: 'uint256' },
        ],
        name: 'vote',
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

class LockToVoteTransactionUtils {
    buildVoteData = (params: IBuildVoteDataParams<number, ILockToVoteOption>): Hex => {
        const { lockAmount } = params.vote;

        const shouldLock = lockAmount != null && lockAmount > 0;
        const data = shouldLock ? this.buildLockAndVoteData(params) : this.buildVoteDataDefault(params);

        return data;
    };

    private buildLockAndVoteData = (params: IBuildVoteDataParams<number, ILockToVoteOption>): Hex => {
        const { proposalIndex, vote } = params;

        const data = encodeFunctionData({
            abi: lockManagerAbi,
            functionName: 'lockAndVote',
            args: [BigInt(proposalIndex), vote.value, vote.lockAmount as bigint],
        });

        return data;
    };

    private buildVoteDataDefault = (params: IBuildVoteDataParams<number, ILockToVoteOption>): Hex => {
        const { proposalIndex, vote } = params;

        const data = encodeFunctionData({
            abi: lockToVoteAbi,
            functionName: 'vote',
            args: [BigInt(proposalIndex), vote.voter as Hex, vote.value, BigInt(0)], // todo: new-voting-power
        });

        return data;
    };
}

export const lockToVoteTransactionUtils = new LockToVoteTransactionUtils();

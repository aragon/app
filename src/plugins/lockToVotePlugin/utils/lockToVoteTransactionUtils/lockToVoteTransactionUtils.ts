import type { IBuildVoteDataOption, IBuildVoteDataParams } from '@/modules/governance/types';
import { encodeFunctionData, type Hex } from 'viem';
import { lockManagerAbi, lockToVoteAbi } from './lockToVoteAbi';

export interface ILockToVoteOption extends IBuildVoteDataOption {
    /**
     * Amount to be locked before voting.
     */
    lockAmount?: bigint;
    /**
     * Address of the voter.
     */
    voter: string;
}

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

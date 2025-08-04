import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import type {
    IBuildCreateProposalDataParams,
    IBuildVoteDataOption,
    IBuildVoteDataParams,
} from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { encodeFunctionData, zeroHash, type Hex } from 'viem';
import { lockManagerAbi, lockToVoteAbi } from './lockToVoteAbi';

// The end-date form values are set to "partial" because users can also create proposals without the proposal wizard
export interface ICreateLockToVoteProposalFormData extends IProposalCreate, Partial<ICreateProposalEndDateForm> {}

export interface ILockToVoteOption extends IBuildVoteDataOption {
    /**
     * Amount to be locked before voting.
     */
    lockAmount?: bigint;
}

class LockToVoteTransactionUtils {
    buildCreateProposalData = (
        params: IBuildCreateProposalDataParams<ICreateLockToVoteProposalFormData, ITokenPluginSettings>,
    ): Hex => {
        const { metadata, actions, proposal, plugin } = params;
        const { minDuration } = plugin.settings;

        // Handle proposals without time settings in the following way:
        //   - startDate set to 0
        //   - if there is minDuration, and minDuration is more than 7 days, set endDate to minDuration
        //   - otherwise, set endDate to 7 days from now
        const startDate = createProposalUtils.parseStartDate(proposal);
        const endDate =
            proposal.endTimeMode != null
                ? createProposalUtils.parseEndDate(proposal)
                : createProposalUtils.createDefaultEndDate(minDuration);

        const data = encodeFunctionData({
            abi: lockToVoteAbi,
            functionName: 'createProposal',
            args: [metadata, actions, BigInt(startDate), BigInt(endDate), zeroHash],
        });

        return data;
    };

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
            abi: lockManagerAbi,
            functionName: 'vote',
            args: [BigInt(proposalIndex), vote.value],
        });

        return data;
    };
}

export const lockToVoteTransactionUtils = new LockToVoteTransactionUtils();

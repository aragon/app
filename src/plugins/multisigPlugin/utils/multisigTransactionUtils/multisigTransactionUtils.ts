import type { IBuildCreateProposalDataParams, IBuildVoteDataParams } from '@/modules/governance/types';
import { encodeFunctionData, type Hex } from 'viem';
import { multisigPluginAbi } from './multisigPluginAbi';

class MultisigTransactionUtils {
    buildCreateProposalData = (params: IBuildCreateProposalDataParams): Hex => {
        const { metadata, actions, startDate, endDate } = params;

        const functionArgs = [metadata, actions, BigInt(0), false, false, startDate, endDate];
        const data = encodeFunctionData({
            abi: multisigPluginAbi,
            functionName: 'createProposal',
            args: functionArgs,
        });

        return data;
    };

    buildVoteData = (params: IBuildVoteDataParams): Hex => {
        const { proposalIndex } = params;

        const functionArgs = [proposalIndex, false];

        const data = encodeFunctionData({
            abi: multisigPluginAbi,
            functionName: 'approve',
            args: functionArgs,
        });

        return data;
    };
}

export const multisigTransactionUtils = new MultisigTransactionUtils();

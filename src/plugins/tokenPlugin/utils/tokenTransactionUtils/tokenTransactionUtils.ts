import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { encodeFunctionData, type Hex } from 'viem';
import { tokenPluginAbi } from './abi/tokenPlugin';

class TokenTransactionUtils {
    buildCreateProposalData = (params: IBuildCreateProposalDataParams): Hex => {
        const { metadata, actions, startDate, endDate } = params;

        const functionArgs = [metadata, actions, BigInt(0), startDate, endDate, 0, false];
        const data = encodeFunctionData({
            abi: tokenPluginAbi,
            functionName: 'createProposal',
            args: functionArgs,
        });

        return data;
    };
}

export const tokenTransactionUtils = new TokenTransactionUtils();

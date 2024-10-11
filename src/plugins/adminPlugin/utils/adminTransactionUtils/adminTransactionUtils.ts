import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { encodeFunctionData, type Hex } from 'viem';
import { adminPluginAbi } from './adminPluginAbi';

class AdminTransactionUtils {
    buildCreateProposalData = (params: IBuildCreateProposalDataParams): Hex => {
        const { metadata, actions } = params;

        const functionArgs = [metadata, actions, BigInt(0), BigInt(0), null];
        const data = encodeFunctionData({
            abi: adminPluginAbi,
            functionName: 'createProposal',
            args: functionArgs,
        });

        return data;
    };
}

export const adminTransactionUtils = new AdminTransactionUtils();

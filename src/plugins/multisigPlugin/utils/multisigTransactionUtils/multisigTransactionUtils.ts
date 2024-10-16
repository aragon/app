import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams, IBuildVoteDataParams } from '@/modules/governance/types';
import type { ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { encodeFunctionData, type Hex } from 'viem';
import { multisigPluginAbi } from './multisigPluginAbi';

export interface ICreateMultisigProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

class MultisigTransactionUtils {
    buildCreateProposalData = (params: IBuildCreateProposalDataParams<ICreateMultisigProposalFormData>): Hex => {
        const { metadata, actions, values } = params;

        const startDate = createProposalUtils.parseStartDate(values);
        const endDate = createProposalUtils.parseEndDate(values);

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

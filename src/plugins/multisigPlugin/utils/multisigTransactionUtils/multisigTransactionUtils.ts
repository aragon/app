import type { IBuildPreparePluginInstallDataParams } from '@/modules/createDao/types';
import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams, IBuildVoteDataParams } from '@/modules/governance/types';
import type { ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, type Hex } from 'viem';
import { multisigPlugin } from '../../constants/multisigPlugin';
import { multisigPluginAbi, multisigPluginSetupAbi } from './multisigPluginAbi';

export interface ICreateMultisigProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

class MultisigTransactionUtils {
    buildCreateProposalData = (params: IBuildCreateProposalDataParams<ICreateMultisigProposalFormData>): Hex => {
        const { metadata, actions, values } = params;

        const startDate = createProposalUtils.parseStartDate(values);
        const endDate = createProposalUtils.parseEndDate(values);

        const functionArgs = [metadata, actions, BigInt(0), false, false, startDate, endDate];
        const data = encodeFunctionData({ abi: multisigPluginAbi, functionName: 'createProposal', args: functionArgs });

        return data;
    };

    buildVoteData = (params: IBuildVoteDataParams): Hex => {
        const { proposalIndex } = params;

        const functionArgs = [proposalIndex, false];
        const data = encodeFunctionData({ abi: multisigPluginAbi, functionName: 'approve', args: functionArgs });

        return data;
    };

    buildPrepareInstallData = (params: IBuildPreparePluginInstallDataParams) => {
        const { metadataCid, dao, permissionSettings, body } = params;
        const { members, minApprovals } = body;

        const { globalExecutor } = networkDefinitions[dao.network].addresses;
        const repositoryAddress = multisigPlugin.repositoryAddresses[dao.network];

        const memberAddresses = members.map((member) => member.address as Hex);
        const multisigTarget = { target: globalExecutor, operation: 1 };
        const pluginSettings = { onlyListed: permissionSettings != null, minApprovals };

        const pluginSettingsData = encodeAbiParameters(multisigPluginSetupAbi, [
            memberAddresses,
            pluginSettings,
            multisigTarget,
            metadataCid as Hex,
        ]);

        const transactionData = pluginTransactionUtils.buildPrepareInstallationData(
            repositoryAddress,
            multisigPlugin.installVersion,
            pluginSettingsData,
            dao.address as Hex,
        );

        return transactionData;
    };
}

export const multisigTransactionUtils = new MultisigTransactionUtils();

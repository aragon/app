import type {
    ICreateProcessFormBody,
    ICreateProcessFormProposalCreationBody,
} from '@/modules/createDao/components/createProcessForm';
import { multisigPluginSetupAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/multisigPluginSetupAbi';
import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams, IBuildVoteDataParams } from '@/modules/governance/types';
import type { ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { createProposalUtils } from '@/modules/governance/utils/createProposalUtils';
import { type IPluginRepoInfo, pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, type Hex } from 'viem';
import { multisigPluginAbi } from './multisigPluginAbi';

export interface ICreateMultisigProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

class MultisigTransactionUtils {
    private multisigRepo: IPluginRepoInfo = {
        address: '0xA0901B5BC6e04F14a9D0d094653E047644586DdE',
        version: { release: 1, build: 5 },
    };

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

    buildPrepareMultisigInstallData = (
        body: ICreateProcessFormBody,
        metadataCid: string,
        daoAddress: Hex,
        permissionSettings?: ICreateProcessFormProposalCreationBody,
    ) => {
        const { members, multisigThreshold } = body;

        const memberAddresses = members.map((member) => member.address as Hex);
        const multisigTarget = { target: pluginTransactionUtils.globalExecutor, operation: 1 };
        const pluginSettings = { onlyListed: permissionSettings != null, minApprovals: multisigThreshold };

        const pluginSettingsData = encodeAbiParameters(multisigPluginSetupAbi, [
            memberAddresses,
            pluginSettings,
            multisigTarget,
            metadataCid as Hex,
        ]);

        const transactionData = pluginTransactionUtils.buildPrepareInstallationData(
            this.multisigRepo,
            pluginSettingsData,
            daoAddress,
        );

        return transactionData;
    };
}

export const multisigTransactionUtils = new MultisigTransactionUtils();

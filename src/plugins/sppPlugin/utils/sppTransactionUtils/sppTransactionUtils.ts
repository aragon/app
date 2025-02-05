import type { ICreateProcessFormData } from '@/modules/createDao/components/createProcessForm';
import { sppPluginSetupAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/sppPluginSetupAbi';
import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { type IPluginRepoInfo, pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, type Hex } from 'viem';
import { sppPluginAbi } from './sppPluginAbi';

export interface ICreateSppProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

class SppTransactionUtils {
    sppRepo: IPluginRepoInfo = {
        address: '0xE67b8E026d190876704292442A38163Ce6945d6b',
        version: { release: 1, build: 8 },
    };

    prepareSppMetadata = (values: ICreateProcessFormData) => {
        const { name, description, resources: links, processKey } = values;
        const stageNames = values.stages.map((stage) => stage.name);

        return { name, description, links, processKey, stageNames };
    };

    buildCreateProposalData = (params: IBuildCreateProposalDataParams<ICreateSppProposalFormData>): Hex => {
        const { metadata, actions, values } = params;

        const startDate = createProposalUtils.parseStartDate(values);

        const functionArgs = [metadata, actions, BigInt(0), startDate, [[]]];
        const data = encodeFunctionData({
            abi: sppPluginAbi,
            functionName: 'createProposal',
            args: functionArgs,
        });

        return data;
    };

    buildPrepareSppInstallData = (metadataCid: string, daoAddress: Hex) => {
        const sppTarget = { target: daoAddress, operation: 0 };
        const pluginSettingsData = encodeAbiParameters(sppPluginSetupAbi, [metadataCid as Hex, [], [], sppTarget]);

        const transactionData = pluginTransactionUtils.buildPrepareInstallationData(
            this.sppRepo,
            pluginSettingsData,
            daoAddress,
        );

        return transactionData;
    };
}

export const sppTransactionUtils = new SppTransactionUtils();

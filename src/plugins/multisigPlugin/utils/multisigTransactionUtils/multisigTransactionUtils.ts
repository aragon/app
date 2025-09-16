import type { IBuildPreparePluginInstallDataParams } from '@/modules/createDao/types';
import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import type { IBuildCreateProposalDataParams, IBuildVoteDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { IBuildPreparePluginUpdateDataParams } from '@/modules/settings/types';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { encodeAbiParameters, encodeFunctionData, zeroHash, type Hex } from 'viem';
import type { IMultisigSetupGovernanceForm } from '../../components/multisigSetupGovernance';
import { multisigPlugin } from '../../constants/multisigPlugin';
import type { IMultisigPluginSettings } from '../../types';
import { multisigPluginAbi, multisigPluginPrepareUpdateAbi, multisigPluginSetupAbi } from './multisigPluginAbi';

// The end-date form values are set to "partial" because users can also create proposals without the proposal wizard
export interface ICreateMultisigProposalFormData extends IProposalCreate, Partial<ICreateProposalEndDateForm> {}

class MultisigTransactionUtils {
    buildCreateProposalData = (
        params: IBuildCreateProposalDataParams<ICreateMultisigProposalFormData, IMultisigPluginSettings>,
    ): Hex => {
        const { metadata, actions, proposal } = params;

        // Handle proposals without time settings in the following way:
        //   - startDate set to 0
        //   - endDate set to 7 days from now
        const startDate = createProposalUtils.parseStartDate(proposal);
        const endDate =
            proposal.endTimeMode != null
                ? createProposalUtils.parseEndDate(proposal)
                : createProposalUtils.createDefaultEndDate();

        const functionArgs = [metadata, actions, BigInt(0), false, false, startDate, endDate];
        const data = encodeFunctionData({ abi: multisigPluginAbi, functionName: 'createProposal', args: functionArgs });

        return data;
    };

    buildVoteData = (params: IBuildVoteDataParams<undefined>): Hex => {
        const { proposalIndex } = params;

        const functionArgs = [proposalIndex, false];
        const data = encodeFunctionData({ abi: multisigPluginAbi, functionName: 'approve', args: functionArgs });

        return data;
    };

    buildPrepareInstallData = (params: IBuildPreparePluginInstallDataParams<IMultisigSetupGovernanceForm>) => {
        const { metadata, dao, body, stageVotingPeriod } = params;
        const { members } = body.membership;
        const { minApprovals, onlyListed } = body.governance;

        const repositoryAddress = multisigPlugin.repositoryAddresses[dao.network];

        const memberAddresses = members.map((member) => member.address as Hex);
        const multisigTarget = pluginTransactionUtils.getPluginTargetConfig(dao, stageVotingPeriod != null);
        const pluginSettings = { onlyListed, minApprovals };

        const pluginSettingsData = encodeAbiParameters(multisigPluginSetupAbi, [
            memberAddresses,
            pluginSettings,
            multisigTarget,
            metadata,
        ]);

        const transactionData = pluginTransactionUtils.buildPrepareInstallationData(
            repositoryAddress,
            multisigPlugin.installVersion,
            pluginSettingsData,
            dao.address as Hex,
        );

        return transactionData;
    };

    buildPrepareUpdateData = (params: IBuildPreparePluginUpdateDataParams): Hex => {
        const { plugin, dao } = params;
        const { isSubPlugin, metadataIpfs } = plugin;

        const targetConfig = pluginTransactionUtils.getPluginTargetConfig(dao, isSubPlugin);
        const metadata = metadataIpfs != null ? transactionUtils.stringToMetadataHex(metadataIpfs) : zeroHash;
        const transactionData = encodeAbiParameters(multisigPluginPrepareUpdateAbi, [targetConfig, metadata]);

        return transactionData;
    };
}

export const multisigTransactionUtils = new MultisigTransactionUtils();

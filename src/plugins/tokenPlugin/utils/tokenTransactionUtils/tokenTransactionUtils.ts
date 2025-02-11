import type { ITokenVotingMember } from '@/modules/createDao/components/createProcessForm';
import type { IBuildPreparePluginInstallDataParams } from '@/modules/createDao/types';
import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams, IBuildVoteDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, parseUnits, zeroAddress, type Hex } from 'viem';
import { tokenPlugin } from '../../constants/tokenPlugin';
import { tokenSettingsUtils } from '../tokenSettingsUtils';
import { tokenPluginAbi, tokenPluginSetupAbi } from './tokenPluginAbi';

export interface ICreateTokenProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

class TokenTransactionUtils {
    buildCreateProposalData = (params: IBuildCreateProposalDataParams<ICreateTokenProposalFormData>): Hex => {
        const { metadata, actions, values } = params;

        const startDate = createProposalUtils.parseStartDate(values);
        const endDate = createProposalUtils.parseEndDate(values);

        const functionArgs = [metadata, actions, BigInt(0), startDate, endDate, 0, false];
        const data = encodeFunctionData({
            abi: tokenPluginAbi,
            functionName: 'createProposal',
            args: functionArgs,
        });

        return data;
    };

    buildVoteData = (params: IBuildVoteDataParams): Hex => {
        const { proposalIndex, vote } = params;

        const functionArgs = [proposalIndex, vote, false];

        const data = encodeFunctionData({
            abi: tokenPluginAbi,
            functionName: 'vote',
            args: functionArgs,
        });

        return data;
    };

    buildPrepareInstallData = (params: IBuildPreparePluginInstallDataParams) => {
        const { body, metadataCid, dao, permissionSettings, stage } = params;
        const {
            voteChange,
            supportThreshold,
            minimumParticipation,
            tokenType,
            importTokenAddress,
            tokenName,
            tokenSymbol,
            members,
        } = body;
        const { earlyStageAdvance, votingPeriod } = stage.timing;
        const { minVotingPower } = permissionSettings ?? {};

        const { globalExecutor } = networkDefinitions[dao.network].addresses;
        const repositoryAddress = tokenPlugin.repositoryAddresses[dao.network];

        const votingMode = voteChange
            ? DaoTokenVotingMode.VOTE_REPLACEMENT
            : earlyStageAdvance
              ? DaoTokenVotingMode.EARLY_EXECUTION
              : DaoTokenVotingMode.STANDARD;

        const minProposerVotingPower = minVotingPower ? parseUnits(minVotingPower, 18) : BigInt(0);

        const votingSettings = {
            votingMode,
            supportThreshold: tokenSettingsUtils.fromPercentageToRatio(supportThreshold),
            minParticipation: tokenSettingsUtils.fromPercentageToRatio(minimumParticipation),
            minDuration: BigInt(dateUtils.durationToSeconds(votingPeriod)),
            minProposerVotingPower: minProposerVotingPower,
        };

        const tokenSettings = {
            addr: tokenType === 'imported' ? (importTokenAddress as Hex) : zeroAddress,
            name: tokenName ?? '',
            symbol: tokenSymbol ?? '',
        };

        const defaultMintSettings = { receivers: [], amounts: [] };
        const mintSettings = members.reduce<{ receivers: Hex[]; amounts: bigint[] }>(
            (current, member) => ({
                receivers: current.receivers.concat(member.address as Hex),
                amounts: current.amounts.concat(parseUnits((member as ITokenVotingMember).tokenAmount.toString(), 18)),
            }),
            defaultMintSettings,
        );

        const tokenTarget = { target: globalExecutor, operation: 1 };
        const pluginSettingsData = encodeAbiParameters(tokenPluginSetupAbi, [
            votingSettings,
            tokenSettings,
            tokenType === 'imported' ? defaultMintSettings : mintSettings,
            tokenTarget,
            BigInt(0),
            metadataCid as Hex,
        ]);

        const transactionData = pluginTransactionUtils.buildPrepareInstallationData(
            repositoryAddress,
            tokenPlugin.installVersion,
            pluginSettingsData,
            dao.address as Hex,
        );

        return transactionData;
    };
}

export const tokenTransactionUtils = new TokenTransactionUtils();

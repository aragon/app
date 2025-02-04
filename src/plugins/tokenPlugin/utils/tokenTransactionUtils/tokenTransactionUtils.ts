import type {
    ICreateProcessFormBody,
    ICreateProcessFormProposalCreationBody,
    ICreateProcessFormStage,
    ITokenVotingMember,
} from '@/modules/createDao/components/createProcessForm';
import { tokenPluginSetupAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/tokenPluginSetupAbi';
import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams, IBuildVoteDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { DaoTokenVotingMode } from '@/plugins/tokenPlugin/types';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginInstallationUtils } from '@/shared/utils/pluginInstallationUtils';
import type { IPluginRepoInfo } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, parseUnits, zeroAddress, type Hex } from 'viem';
import { tokenPluginAbi } from './tokenPluginAbi';

export interface ICreateTokenProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

class TokenTransactionUtils {
    private tokenRepo: IPluginRepoInfo = {
        address: '0x6241ad0D3f162028d2e0000f1A878DBc4F5c4aD0',
        version: { release: 1, build: 5 },
    };

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

    buildPrepareTokenInstallData = (
        body: ICreateProcessFormBody,
        metadataCid: string,
        daoAddress: Hex,
        stage: ICreateProcessFormStage,
        permissionSettings?: ICreateProcessFormProposalCreationBody,
    ) => {
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

        const votingMode = voteChange
            ? DaoTokenVotingMode.VOTE_REPLACEMENT
            : earlyStageAdvance
              ? DaoTokenVotingMode.EARLY_EXECUTION
              : DaoTokenVotingMode.STANDARD;

        const minProposerVotingPower = minVotingPower ? parseUnits(minVotingPower, 18) : BigInt(0);
        const votingSettings = {
            votingMode,
            supportThreshold: supportThreshold * 10 ** 4,
            minParticipation: minimumParticipation * 10 ** 4,
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

        const tokenTarget = { target: pluginInstallationUtils.globalExecutor, operation: 1 };
        const pluginSettingsData = encodeAbiParameters(tokenPluginSetupAbi, [
            votingSettings,
            tokenSettings,
            tokenType === 'imported' ? defaultMintSettings : mintSettings,
            tokenTarget,
            BigInt(0),
            metadataCid as Hex,
        ]);

        const transactionData = pluginInstallationUtils.buildPrepareInstallationData(
            this.tokenRepo,
            pluginSettingsData,
            daoAddress,
        );

        return transactionData;
    };
}

export const tokenTransactionUtils = new TokenTransactionUtils();

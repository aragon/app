import type { IBuildPreparePluginInstallDataParams } from '@/modules/createDao/types';
import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams, IBuildVoteDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, parseUnits, type Hex } from 'viem';
import type { ITokenSetupGovernanceForm } from '../../components/tokenSetupGovernance';
import type { ITokenSetupMembershipForm, ITokenSetupMembershipMember } from '../../components/tokenSetupMembership';
import { tokenPlugin } from '../../constants/tokenPlugin';
import { tokenSettingsUtils } from '../tokenSettingsUtils';
import { tokenPluginAbi, tokenPluginSetupAbi } from './tokenPluginAbi';

export interface ICreateTokenProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

export interface IPrepareTokenInstallDataParams
    extends IBuildPreparePluginInstallDataParams<
        ITokenSetupGovernanceForm,
        ITokenSetupMembershipMember,
        ITokenSetupMembershipForm
    > {}

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

    buildPrepareInstallData = (params: IPrepareTokenInstallDataParams) => {
        const { body, metadataCid, dao, stageVotingPeriod } = params;
        const { members } = body.membership;
        const { name: tokenName, symbol: tokenSymbol, address: tokenAddress } = body.membership.token;

        const repositoryAddress = tokenPlugin.repositoryAddresses[dao.network];
        const tokenSettings = { addr: tokenAddress as Hex, name: tokenName, symbol: tokenSymbol };

        const mintSettings = members.reduce<{ receivers: Hex[]; amounts: bigint[] }>(
            (current, member) => ({
                receivers: current.receivers.concat(member.address as Hex),
                amounts: current.amounts.concat(parseUnits(member.tokenAmount?.toString() ?? '0', 18)),
            }),
            { receivers: [], amounts: [] },
        );

        const votingSettings = this.buildInstallDataVotingSettings(params);
        const tokenTarget = pluginTransactionUtils.getPluginTargetConfig(dao, stageVotingPeriod != null);

        const pluginSettingsData = encodeAbiParameters(tokenPluginSetupAbi, [
            votingSettings,
            tokenSettings,
            mintSettings,
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

    private buildInstallDataVotingSettings = (params: IPrepareTokenInstallDataParams) => {
        const { body, stageVotingPeriod } = params;

        const { votingMode, supportThreshold, minParticipation, minProposerVotingPower, minDuration } = body.governance;
        const { decimals } = body.membership.token;

        const stageVotingPeriodSeconds = stageVotingPeriod ? dateUtils.durationToSeconds(stageVotingPeriod) : undefined;

        const processedVotingPeriod = stageVotingPeriodSeconds ?? minDuration;
        const parsedProposerVotingPower = parseUnits(minProposerVotingPower, decimals);

        const votingSettings = {
            votingMode,
            supportThreshold: tokenSettingsUtils.percentageToRatio(supportThreshold),
            minParticipation: tokenSettingsUtils.percentageToRatio(minParticipation),
            minDuration: BigInt(processedVotingPeriod),
            minProposerVotingPower: parsedProposerVotingPower,
        };

        return votingSettings;
    };
}

export const tokenTransactionUtils = new TokenTransactionUtils();

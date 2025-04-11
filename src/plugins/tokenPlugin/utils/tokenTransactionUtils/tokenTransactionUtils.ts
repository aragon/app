import type { IBuildPreparePluginInstallDataParams } from '@/modules/createDao/types';
import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
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

// The end-date form values are set to "partial" because users can also create proposals without the proposal wizard
export interface ICreateTokenProposalFormData extends IProposalCreate, Partial<ICreateProposalEndDateForm> {}

export interface IPrepareTokenInstallDataParams
    extends IBuildPreparePluginInstallDataParams<
        ITokenSetupGovernanceForm,
        ITokenSetupMembershipMember,
        ITokenSetupMembershipForm
    > {}

class TokenTransactionUtils {
    buildCreateProposalData = (params: IBuildCreateProposalDataParams<ICreateTokenProposalFormData>): Hex => {
        const { metadata, actions, proposal } = params;

        const startDate = createProposalUtils.parseStartDate(proposal);
        const endDate = createProposalUtils.parseEndDate(proposal);

        const functionArgs = [metadata, actions, BigInt(0), startDate, endDate, 0, false];
        const data = encodeFunctionData({ abi: tokenPluginAbi, functionName: 'createProposal', args: functionArgs });

        return data;
    };

    buildVoteData = (params: IBuildVoteDataParams): Hex => {
        const { proposalIndex, vote } = params;

        const functionArgs = [proposalIndex, vote, false];
        const data = encodeFunctionData({ abi: tokenPluginAbi, functionName: 'vote', args: functionArgs });

        return data;
    };

    buildPrepareInstallData = (params: IPrepareTokenInstallDataParams) => {
        const { body, metadata, dao, stageVotingPeriod } = params;
        const { members } = body.membership;

        const repositoryAddress = tokenPlugin.repositoryAddresses[dao.network];

        const tokenSettings = this.buildInstallDataTokenSettings(body.membership.token);
        const mintSettings = this.buildInstallDataMintSettings(members);
        const votingSettings = this.buildInstallDataVotingSettings(params);
        const tokenTarget = pluginTransactionUtils.getPluginTargetConfig(dao, stageVotingPeriod != null);

        const pluginSettingsData = encodeAbiParameters(tokenPluginSetupAbi, [
            votingSettings,
            tokenSettings,
            mintSettings,
            tokenTarget,
            BigInt(0),
            metadata,
        ]);

        const transactionData = pluginTransactionUtils.buildPrepareInstallationData(
            repositoryAddress,
            tokenPlugin.installVersion,
            pluginSettingsData,
            dao.address as Hex,
        );

        return transactionData;
    };

    private buildInstallDataTokenSettings = (token: ITokenSetupMembershipForm['token']) => {
        const { address, name, symbol } = token;

        return { addr: address as Hex, name, symbol };
    };

    private buildInstallDataMintSettings = (members: ITokenSetupMembershipMember[]) => {
        const initialData: { receivers: Hex[]; amounts: bigint[] } = { receivers: [], amounts: [] };
        const governanceTokenDecimals = 18;

        const mintSettings = members.reduce(
            (current, { address, tokenAmount }) => ({
                receivers: current.receivers.concat(address as Hex),
                amounts: current.amounts.concat(parseUnits(tokenAmount?.toString() ?? '0', governanceTokenDecimals)),
            }),
            initialData,
        );

        return mintSettings;
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

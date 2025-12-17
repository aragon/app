import { encodeAbiParameters, encodeFunctionData, type Hex, parseUnits, zeroHash } from 'viem';
import type { IBuildPreparePluginInstallDataParams } from '@/modules/createDao/types';
import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import type { IBuildCreateProposalDataParams, IBuildVoteDataOption, IBuildVoteDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { IGetUninstallHelpersParams } from '@/modules/settings/types';
import type { ITokenSetupGovernanceForm } from '@/plugins/tokenPlugin/components/tokenSetupGovernance';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ILockToVoteSetupMembershipForm, ILockToVoteSetupMembershipMember } from '../../components/lockToVoteSetupMembership';
import { lockToVotePlugin } from '../../constants/lockToVotePlugin';
import type { ILockToVotePlugin } from '../../types';
import { lockManagerAbi, lockToVoteAbi } from './lockToVoteAbi';
import { lockToVotePluginSetupAbi } from './lockToVotePluginAbi';

// The end-date form values are set to "partial" because users can also create proposals without the proposal wizard
export interface ICreateLockToVoteProposalFormData extends IProposalCreate, Partial<ICreateProposalEndDateForm> {}

export interface ILockToVoteOption extends IBuildVoteDataOption {
    /**
     * Amount to be locked before voting.
     */
    lockAmount?: bigint;
}

export interface IPrepareTokenInstallDataParams
    extends IBuildPreparePluginInstallDataParams<
        ITokenSetupGovernanceForm,
        ILockToVoteSetupMembershipMember,
        ILockToVoteSetupMembershipForm
    > {}

class LockToVoteTransactionUtils {
    private readonly anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';

    buildPrepareInstallData = (params: IPrepareTokenInstallDataParams) => {
        const { body, metadata, dao, stageVotingPeriod } = params;
        const { token } = body.membership;

        const repositoryAddress = lockToVotePlugin.repositoryAddresses[dao.network];

        const votingSettings = this.buildInstallDataVotingSettings(params);
        const targetConfig = pluginTransactionUtils.getPluginTargetConfig(dao, stageVotingPeriod != null);

        const pluginSettingsData = encodeAbiParameters(lockToVotePluginSetupAbi, [
            {
                token: token.address as Hex,
                votingSettings,
                pluginMetadata: metadata,
                createProposalCaller: this.anyAddress,
                executeCaller: this.anyAddress,
                targetConfig,
            },
        ]);

        const transactionData = pluginTransactionUtils.buildPrepareInstallationData(
            repositoryAddress,
            lockToVotePlugin.installVersion,
            pluginSettingsData,
            dao.address as Hex
        );

        return transactionData;
    };

    buildCreateProposalData = (params: IBuildCreateProposalDataParams<ICreateLockToVoteProposalFormData, ITokenPluginSettings>): Hex => {
        const { metadata, actions, proposal } = params;

        const startDate = createProposalUtils.parseStartDate(proposal);
        // If set to 0, smart contracts will use the default end date `startDate + votingSettings.proposalDuration`, so
        // we don't need to set it manually based on plugin.settings.minDuration
        const endDate = 0;

        const data = encodeFunctionData({
            abi: lockToVoteAbi,
            functionName: 'createProposal',
            args: [metadata, actions, BigInt(startDate), BigInt(endDate), zeroHash],
        });

        return data;
    };

    buildVoteData = (params: IBuildVoteDataParams<number, ILockToVoteOption>): Hex => {
        const { lockAmount } = params.vote;

        const shouldLock = lockAmount != null && lockAmount > 0;
        const data = shouldLock ? this.buildLockAndVoteData(params) : this.buildVoteDataDefault(params);

        return data;
    };

    getUninstallHelpers = (params: IGetUninstallHelpersParams<ILockToVotePlugin>): Hex[] => {
        const { proposalCreationConditionAddress, lockManagerAddress } = params.plugin;

        return [proposalCreationConditionAddress, lockManagerAddress, this.anyAddress, this.anyAddress] as Hex[];
    };

    private readonly buildInstallDataVotingSettings = (params: IPrepareTokenInstallDataParams) => {
        const { body, stageVotingPeriod } = params;

        const { votingMode, supportThreshold, minParticipation, minProposerVotingPower, minDuration } = body.governance;
        const { decimals } = body.membership.token;

        const stageVotingPeriodSeconds = stageVotingPeriod ? dateUtils.durationToSeconds(stageVotingPeriod) : undefined;

        const processedVotingPeriod = stageVotingPeriodSeconds ?? minDuration;
        const parsedProposerVotingPower = parseUnits(minProposerVotingPower, decimals);

        const votingSettings = {
            votingMode,
            supportThresholdRatio: tokenSettingsUtils.percentageToRatio(supportThreshold),
            minParticipationRatio: tokenSettingsUtils.percentageToRatio(minParticipation),
            minApprovalRatio: 0,
            proposalDuration: BigInt(processedVotingPeriod),
            minProposerVotingPower: parsedProposerVotingPower,
        };

        return votingSettings;
    };

    private readonly buildLockAndVoteData = (params: IBuildVoteDataParams<number, ILockToVoteOption>): Hex => {
        const { proposalIndex, vote } = params;

        const data = encodeFunctionData({
            abi: lockManagerAbi,
            functionName: 'lockAndVote',
            args: [BigInt(proposalIndex), vote.value, vote.lockAmount as bigint],
        });

        return data;
    };

    private readonly buildVoteDataDefault = (params: IBuildVoteDataParams<number, ILockToVoteOption>): Hex => {
        const { proposalIndex, vote } = params;

        const data = encodeFunctionData({
            abi: lockManagerAbi,
            functionName: 'vote',
            args: [BigInt(proposalIndex), vote.value],
        });

        return data;
    };
}

export const lockToVoteTransactionUtils = new LockToVoteTransactionUtils();

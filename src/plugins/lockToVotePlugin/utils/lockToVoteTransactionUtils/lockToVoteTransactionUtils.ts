import type { IBuildPreparePluginInstallDataParams } from '@/modules/createDao/types';
import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import type {
    IBuildCreateProposalDataParams,
    IBuildVoteDataOption,
    IBuildVoteDataParams,
} from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, parseUnits, zeroHash, type Hex } from 'viem';
import type { ILockToVoteSetupGovernanceForm } from '../../components/lockToVoteSetupGovernance';
import type {
    ILockToVoteSetupMembershipForm,
    ILockToVoteSetupMembershipMember,
} from '../../components/lockToVoteSetupMembership';
import { lockToVotePlugin } from '../../constants/lockToVotePlugin';
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
        ILockToVoteSetupGovernanceForm,
        ILockToVoteSetupMembershipMember,
        ILockToVoteSetupMembershipForm
    > {}

class LockToVoteTransactionUtils {
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
            dao.address as Hex,
        );

        return transactionData;
    };

    private buildInstallDataVotingSettings = (params: IPrepareTokenInstallDataParams) => {
        const { body, stageVotingPeriod } = params;

        const { votingMode, supportThreshold, minParticipation, minProposerVotingPower, proposalDuration } =
            body.governance;
        const { decimals } = body.membership.token;

        const stageVotingPeriodSeconds = stageVotingPeriod ? dateUtils.durationToSeconds(stageVotingPeriod) : undefined;

        const processedVotingPeriod = stageVotingPeriodSeconds ?? proposalDuration;
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

    buildCreateProposalData = (
        params: IBuildCreateProposalDataParams<ICreateLockToVoteProposalFormData, ITokenPluginSettings>,
    ): Hex => {
        const { metadata, actions, proposal, plugin } = params;
        const { minDuration } = plugin.settings;

        const startDate = createProposalUtils.parseStartDate(proposal);

        // If startDate is parsed as 0 → also set endDate to 0, letting the contract calculate
        // endDate = actual start at execution + minDuration.
        // If startDate is fixed → compute endDate as an absolute timestamp of the two values.
        const endDate = startDate === 0 ? 0 : startDate + minDuration;

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

    private buildLockAndVoteData = (params: IBuildVoteDataParams<number, ILockToVoteOption>): Hex => {
        const { proposalIndex, vote } = params;

        const data = encodeFunctionData({
            abi: lockManagerAbi,
            functionName: 'lockAndVote',
            args: [BigInt(proposalIndex), vote.value, vote.lockAmount as bigint],
        });

        return data;
    };

    private buildVoteDataDefault = (params: IBuildVoteDataParams<number, ILockToVoteOption>): Hex => {
        const { proposalIndex, vote } = params;

        const data = encodeFunctionData({
            abi: lockManagerAbi,
            functionName: 'vote',
            args: [BigInt(proposalIndex), vote.value],
        });

        return data;
    };

    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';
}

export const lockToVoteTransactionUtils = new LockToVoteTransactionUtils();

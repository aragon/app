import type { IBuildPreparePluginInstallDataParams } from '@/modules/createDao/types';
import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import type { IBuildVoteDataParams } from '@/modules/governance/types';
import { type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { ITokenSetupGovernanceForm } from '@/plugins/tokenPlugin/components/tokenSetupGovernance';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, parseUnits, type Hex } from 'viem';
import type {
    ILockToVoteSetupMembershipForm,
    ILockToVoteSetupMembershipMember,
} from '../../components/lockToVoteSetupMembership';
import { lockToVotePlugin } from '../../constants/lockToVotePlugin';
import { lockToVotePluginAbi, lockToVotePluginSetupAbi } from './lockToVotePluginAbi';

// The end-date form values are set to "partial" because users can also create proposals without the proposal wizard
export interface ICreateLockToVoteProposalFormData extends IProposalCreate, Partial<ICreateProposalEndDateForm> {}

export interface IPrepareTokenInstallDataParams
    extends IBuildPreparePluginInstallDataParams<
        ITokenSetupGovernanceForm,
        ILockToVoteSetupMembershipMember,
        ILockToVoteSetupMembershipForm
    > {}

class LockToVoteTransactionUtils {
    buildVoteData = (params: IBuildVoteDataParams): Hex => {
        const { proposalIndex, vote } = params;

        const functionArgs = [proposalIndex, vote, false];
        const data = encodeFunctionData({ abi: lockToVotePluginAbi, functionName: 'vote', args: functionArgs });

        return data;
    };

    buildPrepareInstallData = (params: IPrepareTokenInstallDataParams) => {
        const { body, metadata, dao, stageVotingPeriod } = params;
        const { token } = body.membership;

        const repositoryAddress = lockToVotePlugin.repositoryAddresses[dao.network];

        const votingSettings = this.buildInstallDataVotingSettings(params);
        const targetConfig = pluginTransactionUtils.getPluginTargetConfig(dao, stageVotingPeriod != null);

        const pluginSettingsData = encodeAbiParameters(
            [{ name: 'params', type: 'tuple', components: lockToVotePluginSetupAbi }],
            [
                {
                    token: token.address as Hex,
                    votingSettings,
                    pluginMetadata: metadata,
                    createProposalCaller: this.anyAddress,
                    executeCaller: this.anyAddress,
                    targetConfig,
                },
            ],
        );

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

    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';
}

export const lockToVoteTransactionUtils = new LockToVoteTransactionUtils();

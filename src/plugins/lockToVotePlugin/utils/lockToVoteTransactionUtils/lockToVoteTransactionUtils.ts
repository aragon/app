import type { IBuildPreparePluginInstallDataParams } from '@/modules/createDao/types';
import type { ITokenSetupGovernanceForm } from '@/plugins/tokenPlugin/components/tokenSetupGovernance';
import { tokenSettingsUtils } from '@/plugins/tokenPlugin/utils/tokenSettingsUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, parseUnits, type Hex } from 'viem';
import type {
    ILockToVoteSetupMembershipForm,
    ILockToVoteSetupMembershipMember,
} from '../../components/lockToVoteSetupMembership';
import { lockToVotePlugin } from '../../constants/lockToVotePlugin';
import { lockToVotePluginSetupAbi } from './lockToVotePluginAbi';

export interface IPrepareTokenInstallDataParams
    extends IBuildPreparePluginInstallDataParams<
        ITokenSetupGovernanceForm,
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

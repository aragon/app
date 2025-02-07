import {
    type ICreateProcessFormData,
    ProcessStageType,
    ProposalCreationMode,
} from '@/modules/createDao/components/createProcessForm';
import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { encodeFunctionData, type Hex } from 'viem';
import { SppProposalType } from '../../types';
import { sppPluginAbi } from './sppPluginAbi';
import type { IPluginSetupData } from '@/shared/types/pluginSetupData';
import { prepareProcessDialogUtils } from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';

export interface ICreateSppProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

class SppTransactionUtils {
    private defaultMaxAdvance = BigInt(dateUtils.durationToSeconds({ days: 36500, hours: 0, minutes: 0 })); // 10 years

    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';

    private permissionIds = {
        applyMultiTargetPermission: 'ROOT_PERMISSION', // TODO: failing without root-permission
        createProposalPermission: 'CREATE_PROPOSAL_PERMISSION',
        executePermission: 'EXECUTE_PERMISSION',
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

    buildUpdateRulesTransaction = (values: ICreateProcessFormData, setupData: IPluginSetupData[]) => {
        const { permissions, stages } = values;
        const { proposalCreationBodies, proposalCreationMode } = permissions;

        // SPP setup data is the first element of the setupData array and the related rule-condition contract is the
        // first item of the helpers address array (similarly for the plugin-specific conditions)
        const sppRuleCondition = setupData[0].preparedSetupData.helpers[0];

        if (proposalCreationMode === ProposalCreationMode.ANY_WALLET) {
            return undefined;
        }

        const conditionAddresses = stages
            .flatMap((stage) => stage.bodies)
            .reduce<string[]>((current, body, bodyIndex) => {
                const isBodyAllowed = proposalCreationBodies.find((bodySettings) => bodySettings.bodyId === body.id);

                return isBodyAllowed ? [...current, setupData[bodyIndex + 1].preparedSetupData.helpers[0]] : current;
            }, []);

        const conditionRules = permissionTransactionUtils.buildRuleConditions(conditionAddresses, []);

        const transactionData = encodeFunctionData({
            abi: sppPluginAbi,
            functionName: 'updateRules',
            args: [conditionRules],
        });

        return { to: sppRuleCondition, data: transactionData, value: '0' };
    };

    buildUpdateStagesTransaction = (values: ICreateProcessFormData, pluginAddresses: Hex[]) => {
        const { stages } = values;
        const [sppAddress, ...bodyAddresses] = pluginAddresses;

        const processedStages = stages.map((stage) => {
            const isTimelockStage = stage.type === ProcessStageType.TIMELOCK;

            const bodies = stage.bodies.map(() => {
                const pluginAddress = bodyAddresses.shift()!;

                return {
                    addr: pluginAddress,
                    isManual: false,
                    tryAdvance: true,
                    resultType:
                        stage.type === ProcessStageType.NORMAL ? SppProposalType.APPROVAL : SppProposalType.VETO,
                };
            });

            const votingPeriod = BigInt(dateUtils.durationToSeconds(stage.timing.votingPeriod));

            const voteDuration = isTimelockStage ? BigInt(0) : votingPeriod;

            const maxAdvance =
                stage.timing.stageExpiration != null
                    ? BigInt(dateUtils.durationToSeconds(stage.timing.stageExpiration)) + voteDuration
                    : undefined;

            return {
                bodies,
                minAdvance: stage.timing.earlyStageAdvance ? BigInt(0) : votingPeriod,
                maxAdvance: maxAdvance ?? this.defaultMaxAdvance,
                voteDuration,
                approvalThreshold: stage.type === ProcessStageType.NORMAL ? stage.requiredApprovals : 0,
                vetoThreshold: stage.type === ProcessStageType.OPTIMISTIC ? stage.requiredApprovals : 0,
                cancelable: false,
                editable: false,
            };
        });

        const transactionData = encodeFunctionData({
            abi: sppPluginAbi,
            functionName: 'updateStages',
            args: [processedStages],
        });

        return { to: sppAddress, data: transactionData, value: '0' };
    };

    buildInstallActions = (values: ICreateProcessFormData, setupData: IPluginSetupData[], daoAddress: Hex) => {
        const pluginAddresses = setupData.map((data) => data.pluginAddress);

        const grantMultiTargetPermissionAction = permissionTransactionUtils.buildGrantPermissionTransaction({
            where: daoAddress,
            who: prepareProcessDialogUtils.pspRepoAddress,
            what: this.permissionIds.applyMultiTargetPermission,
            to: daoAddress,
        });
        const applyInstallationActions = pluginTransactionUtils.buildApplyInstallationTransactions(
            setupData,
            daoAddress,
        );
        const updateStagesAction = this.buildUpdateStagesTransaction(values, pluginAddresses);
        const updateCreateProposalRulesAction = this.buildUpdateRulesTransaction(values, setupData);

        // Skip first setupData item as it is related to the SPP plugin
        const pluginPermissionActions = setupData.slice(1).map((pluginData) => {
            const { pluginAddress: bodyAddress } = pluginData;

            // No one should be able to create proposals directly on sub-plugins
            const revokePluginCreateProposalAction = permissionTransactionUtils.buildRevokePermissionTransaction({
                where: bodyAddress,
                who: this.anyAddress,
                what: this.permissionIds.createProposalPermission,
                to: daoAddress,
            });

            // Allow SPP to create proposals on sub-plugins
            const grantSppCreateProposalAction = permissionTransactionUtils.buildGrantPermissionTransaction({
                where: bodyAddress,
                who: pluginAddresses[0], // SPP address
                what: this.permissionIds.createProposalPermission,
                to: daoAddress,
            });

            // Sub-plugin shouldn't have execute permission as SPP will already have it
            const revokeExecutePermission = permissionTransactionUtils.buildRevokePermissionTransaction({
                where: daoAddress,
                who: bodyAddress,
                what: this.permissionIds.executePermission,
                to: daoAddress,
            });

            return [revokePluginCreateProposalAction, grantSppCreateProposalAction, revokeExecutePermission];
        });

        const revokeMultiTargetPermissionAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: prepareProcessDialogUtils.pspRepoAddress,
            what: this.permissionIds.applyMultiTargetPermission,
            to: daoAddress,
        });

        return [
            grantMultiTargetPermissionAction,
            ...applyInstallationActions,
            updateStagesAction,
            updateCreateProposalRulesAction,
            ...pluginPermissionActions.flat(),
            revokeMultiTargetPermissionAction,
        ].filter((action) => action != null);
    };
}

export const sppTransactionUtils = new SppTransactionUtils();

import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { encodeFunctionData, type Hex } from 'viem';
import { sppPluginAbi } from './sppPluginAbi';
import {
    type ICreateProcessFormData,
    ProcessStageType,
    ProposalCreationMode,
} from '@/modules/createDao/components/createProcessForm';
import type { IPluginSetupData } from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { publishProcessDialogUtils } from '@/modules/createDao/dialogs/publishProcessDialog/publishProcessDialogUtils';
import { dateUtils } from '@/shared/utils/dateUtils';
import { SppProposalType } from '../../types';

export interface ICreateSppProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

class SppTransactionUtils {
    private defaultMaxAdvance = BigInt(dateUtils.durationToSeconds({ days: 36500, hours: 0, minutes: 0 })); // 10 years

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

    // Identifiers of rule conditions (see https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L12)
    private ruleConditionId = {
        condition: 202,
        logicOperation: 203,
    };

    // Operations for conditions (see https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L43)
    private ruleConditionOperator = {
        eq: 1,
        or: 10,
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

        const conditionRules = publishProcessDialogUtils.buildCreateProposalRuleConditions(conditionAddresses, []);

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
}

export const sppTransactionUtils = new SppTransactionUtils();

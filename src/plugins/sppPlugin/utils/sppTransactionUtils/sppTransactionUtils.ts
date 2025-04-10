import {
    type ICreateProcessFormData,
    ProcessStageType,
    ProposalCreationMode,
} from '@/modules/createDao/components/createProcessForm';
import type { ISetupStageTimingForm } from '@/modules/createDao/dialogs/setupStageTimingDialog';
import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { IDao } from '@/shared/api/daoService';
import { dateUtils } from '@/shared/utils/dateUtils';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { type IPluginSetupData, pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { encodeAbiParameters, encodeFunctionData, type Hex } from 'viem';
import { sppPlugin } from '../../constants/sppPlugin';
import { SppProposalType } from '../../types';
import { sppPluginAbi, sppPluginSetupAbi } from './sppPluginAbi';

export interface ICreateSppProposalFormData extends IProposalCreate, ICreateProposalEndDateForm {}

class SppTransactionUtils {
    // When stage expiration is not defined, we set a default max-advance to 100 years
    private defaultMaxAdvance = BigInt(dateUtils.durationToSeconds({ days: 36525, hours: 0, minutes: 0 }));

    // A special address for encoding permissions
    // See https://github.com/aragon/osx/blob/main/packages/contracts/src/core/permission/PermissionManager.sol#L23
    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';

    buildCreateProposalData = (params: IBuildCreateProposalDataParams<ICreateSppProposalFormData>): Hex => {
        const { metadata, actions, values } = params;

        const startDate = createProposalUtils.parseStartDate(values);

        const functionArgs = [metadata, actions, BigInt(0), startDate, [[]]];
        const data = encodeFunctionData({ abi: sppPluginAbi, functionName: 'createProposal', args: functionArgs });

        return data;
    };

    buildPreparePluginInstallData = (metadataCid: string, dao: IDao) => {
        const { address: daoAddress, network } = dao;

        const repositoryAddress = sppPlugin.repositoryAddresses[network];

        const target = { target: daoAddress as Hex, operation: 0 };
        const pluginSettingsData = encodeAbiParameters(sppPluginSetupAbi, [metadataCid as Hex, [], [], target]);

        const transactionData = pluginTransactionUtils.buildPrepareInstallationData(
            repositoryAddress,
            sppPlugin.installVersion,
            pluginSettingsData,
            daoAddress as Hex,
        );

        return transactionData;
    };

    buildPluginsSetupActions = (
        values: ICreateProcessFormData,
        setupData: IPluginSetupData[],
        dao: IDao,
    ): ITransactionRequest[] => {
        const daoAddress = dao.address as Hex;

        // The SPP plugin is the one prepared first, the setupData array contains the data for the SPP plugin as the first element.
        const [sppAddress, ...pluginAddresses] = setupData.map((data) => data.pluginAddress);
        const [sppSetupData, ...pluginSetupData] = setupData;

        const updateStages = this.buildUpdateStagesTransaction(values, sppAddress, pluginAddresses);
        const updateCreateProposalRules = this.buildUpdateRulesTransaction(values, sppSetupData, pluginSetupData);

        const updatePluginPermissions = pluginSetupData
            .map((data) => this.buildBodyPermissionActions(data, daoAddress, sppAddress))
            .flat();

        return [updateStages, updateCreateProposalRules, ...updatePluginPermissions].filter((action) => action != null);
    };

    private buildBodyPermissionActions = (
        pluginData: IPluginSetupData,
        daoAddress: Hex,
        sppAddress: Hex,
    ): ITransactionRequest[] => {
        const { pluginAddress: bodyAddress } = pluginData;

        // No address should be able to create proposals directly on sub-plugins
        const revokePluginCreateProposalAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: bodyAddress,
            who: this.anyAddress,
            what: permissionTransactionUtils.permissionIds.createProposalPermission,
            to: daoAddress,
        });

        // Allow SPP to create proposals on sub-plugins
        const grantSppCreateProposalAction = permissionTransactionUtils.buildGrantPermissionTransaction({
            where: bodyAddress,
            who: sppAddress,
            what: permissionTransactionUtils.permissionIds.createProposalPermission,
            to: daoAddress,
        });

        // Sub-plugin should not have execute permission on the DAO, only SPP should have execute permission
        const revokeExecutePermission = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: bodyAddress,
            what: permissionTransactionUtils.permissionIds.executePermission,
            to: daoAddress,
        });

        return [revokePluginCreateProposalAction, grantSppCreateProposalAction, revokeExecutePermission];
    };

    private buildUpdateRulesTransaction = (
        values: ICreateProcessFormData,
        sppSetupData: IPluginSetupData,
        pluginSetupData: IPluginSetupData[],
    ): ITransactionRequest | undefined => {
        const { bodies, proposalCreationMode } = values;

        const sppRuleConditionContract = sppSetupData.preparedSetupData.helpers[0];

        if (proposalCreationMode === ProposalCreationMode.ANY_WALLET) {
            return undefined;
        }

        const conditionAddresses = bodies.reduce<string[]>((current, body, bodyIndex) => {
            const isBodyAllowed = body.canCreateProposal;
            const bodyConditionAddress = pluginSetupData[bodyIndex].preparedSetupData.helpers[0];

            return isBodyAllowed ? [...current, bodyConditionAddress] : current;
        }, []);

        const conditionRules = permissionTransactionUtils.buildRuleConditions(conditionAddresses, []);

        const transactionData = encodeFunctionData({
            abi: sppPluginAbi,
            functionName: 'updateRules',
            args: [conditionRules],
        });

        return { to: sppRuleConditionContract, data: transactionData, value: BigInt(0) };
    };

    private buildUpdateStagesTransaction = (
        values: ICreateProcessFormData,
        sppAddress: Hex,
        bodyAddresses: Hex[],
    ): ITransactionRequest => {
        const { stages } = values;

        const processedBodyAddresses = [...bodyAddresses];
        const processedStages = stages.map((stage) => {
            const { type, timing, requiredApprovals } = stage;
            const stageBodies = values.bodies.filter((body) => body.stageId === stage.internalId);

            const stageTiming = this.processStageTiming(timing);
            const stageApprovals = this.processStageApprovals(requiredApprovals, type);

            const resultType = type === ProcessStageType.NORMAL ? SppProposalType.APPROVAL : SppProposalType.VETO;

            const bodySettings = { isManual: false, tryAdvance: true };
            const processedBodies = stageBodies.map(() => ({
                addr: processedBodyAddresses.shift()!,
                resultType,
                ...bodySettings,
            }));

            return { bodies: processedBodies, ...stageApprovals, ...stageTiming, cancelable: false, editable: false };
        });

        const transactionData = encodeFunctionData({
            abi: sppPluginAbi,
            functionName: 'updateStages',
            args: [processedStages],
        });

        return { to: sppAddress, data: transactionData, value: BigInt(0) };
    };

    private processStageApprovals = (requiredApprovals: number, stageType: ProcessStageType) => {
        const approvalThreshold = stageType === ProcessStageType.NORMAL ? requiredApprovals : 0;
        const vetoThreshold = stageType === ProcessStageType.OPTIMISTIC ? requiredApprovals : 0;

        return { approvalThreshold, vetoThreshold };
    };

    private processStageTiming = (timing: ISetupStageTimingForm) => {
        const { votingPeriod, stageExpiration, earlyStageAdvance } = timing;

        const voteDuration = BigInt(dateUtils.durationToSeconds(votingPeriod));
        const processedStageExpiration =
            stageExpiration != null ? voteDuration + BigInt(dateUtils.durationToSeconds(stageExpiration)) : undefined;

        const minAdvance = earlyStageAdvance ? BigInt(0) : voteDuration;
        const maxAdvance = processedStageExpiration ?? this.defaultMaxAdvance;

        return { minAdvance, maxAdvance, voteDuration };
    };
}

export const sppTransactionUtils = new SppTransactionUtils();

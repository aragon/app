'use client';

import { encodeAbiParameters, encodeFunctionData, type Hex } from 'viem';
import {
    type ICreateProcessFormDataAdvanced,
    ProcessStageType,
    ProposalCreationMode,
} from '@/modules/createDao/components/createProcessForm';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { ISetupStageSettingsForm } from '@/modules/createDao/dialogs/setupStageSettingsDialog';
import { BodyType } from '@/modules/createDao/types/enum';
import type { IProposalCreate } from '@/modules/governance/dialogs/publishProposalDialog';
import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { IGetUninstallHelpersParams } from '@/modules/settings/types';
import type { IDao } from '@/shared/api/daoService';
import { dateUtils } from '@/shared/utils/dateUtils';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { type IPluginInstallationSetupData, pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import { sppPlugin } from '../../constants/sppPlugin';
import { SppProposalType } from '../../types';
import { sppPluginAbi, sppPluginSetupAbi } from './sppPluginAbi';

export interface ICreateSppProposalFormData extends IProposalCreate, ICreateProposalEndDateForm {}

class SppTransactionUtils {
    // When stage expiration is not defined, we set a default max-advance to 100 years
    private defaultMaxAdvance = BigInt(dateUtils.durationToSeconds({ days: 36_525, hours: 0, minutes: 0 }));

    // A special address for encoding permissions
    // See https://github.com/aragon/osx/blob/main/packages/contracts/src/core/permission/PermissionManager.sol#L23
    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';

    buildCreateProposalData = (params: IBuildCreateProposalDataParams<ICreateSppProposalFormData>): Hex => {
        const { metadata, actions, proposal } = params;

        const startDate = createProposalUtils.parseStartDate(proposal);

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
            daoAddress as Hex
        );

        return transactionData;
    };

    buildPluginsSetupActions = (
        values: ICreateProcessFormDataAdvanced,
        setupData: IPluginInstallationSetupData[],
        dao: IDao,
        safeConditionAddresses: Hex[]
    ): ITransactionRequest[] => {
        const daoAddress = dao.address as Hex;

        // The SPP plugin is the one prepared first, the setupData array contains the data for the SPP plugin as the first element.
        const [sppAddress, ...pluginAddresses] = setupData.map((data) => data.pluginAddress);
        const [sppSetupData, ...pluginSetupData] = setupData;

        const updateStages = this.buildUpdateStagesTransaction(values.stages, sppAddress, pluginAddresses);
        const updateCreateProposalRules = this.buildUpdateRulesTransaction(values, sppSetupData, pluginSetupData, safeConditionAddresses);

        const updateNewPluginPermissions = pluginAddresses.map((bodyAddress) =>
            this.buildBodyPermissionActions(bodyAddress, daoAddress, sppAddress)
        );

        const updateExistingPluginPermissions = values.stages
            .flatMap((stage) => stage.bodies)
            .filter((body) => body.type === BodyType.EXISTING)
            .map((body) => this.buildGrantSppProposalCreationAction(body.address as Hex, daoAddress, sppAddress));

        return [
            updateStages,
            updateCreateProposalRules,
            ...updateNewPluginPermissions.flat(),
            ...updateExistingPluginPermissions.flat(),
        ].filter((action) => action != null);
    };

    getUninstallHelpers = (params: IGetUninstallHelpersParams): Hex[] => {
        const { proposalCreationConditionAddress } = params.plugin;

        return [proposalCreationConditionAddress] as Hex[];
    };

    private buildBodyPermissionActions = (body: Hex, dao: Hex, spp: Hex): ITransactionRequest[] => {
        // No address should be able to create proposals directly on sub-plugins
        const revokePluginCreateProposalAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: body,
            who: this.anyAddress,
            what: permissionTransactionUtils.permissionIds.createProposalPermission,
            to: dao,
        });

        const grantSppCreateProposalAction = this.buildGrantSppProposalCreationAction(body, dao, spp);

        // Sub-plugin should not have execute permission on the DAO, only SPP should have execute permission
        const revokeExecutePermission = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: dao,
            who: body,
            what: permissionTransactionUtils.permissionIds.executePermission,
            to: dao,
        });

        return [revokePluginCreateProposalAction, grantSppCreateProposalAction, revokeExecutePermission];
    };

    private buildGrantSppProposalCreationAction = (body: Hex, dao: Hex, spp: Hex) => {
        // Allow SPP to create proposals on sub-plugins
        const action = permissionTransactionUtils.buildGrantPermissionTransaction({
            where: body,
            who: spp,
            what: permissionTransactionUtils.permissionIds.createProposalPermission,
            to: dao,
        });

        return action;
    };

    private buildUpdateRulesTransaction = (
        values: ICreateProcessFormDataAdvanced,
        sppSetupData: IPluginInstallationSetupData,
        pluginSetupData: IPluginInstallationSetupData[],
        safeConditionAddresses: Hex[]
    ): ITransactionRequest | undefined => {
        const { stages, proposalCreationMode } = values;

        const sppRuleConditionContract = sppSetupData.preparedSetupData.helpers[0];

        if (proposalCreationMode === ProposalCreationMode.ANY_WALLET) {
            return;
        }

        const bodies = stages.flatMap((stage) => stage.bodies);

        const existingConditionAddresses = bodies
            .filter((body) => body.type === BodyType.EXISTING)
            .filter((body) => body.canCreateProposal)
            .map((body) => body.proposalCreationConditionAddress)
            .filter((address) => address != null);

        const newConditionAddresses = bodies
            .filter((body) => body.type === BodyType.NEW)
            .reduce<string[]>((current, body, index) => {
                const conditionAddress = pluginSetupData[index].preparedSetupData.helpers[0];
                return body.canCreateProposal ? [...current, conditionAddress] : current;
            }, []);

        const conditionAddresses = [...existingConditionAddresses, ...newConditionAddresses, ...safeConditionAddresses];
        const conditionRules = permissionTransactionUtils.buildRuleConditions(conditionAddresses, []);

        const transactionData = encodeFunctionData({
            abi: sppPluginAbi,
            functionName: 'updateRules',
            args: [conditionRules],
        });

        return { to: sppRuleConditionContract, data: transactionData, value: BigInt(0) };
    };

    private buildUpdateStagesTransaction = (
        stages: ICreateProcessFormDataAdvanced['stages'],
        sppAddress: Hex,
        bodyAddresses: Hex[]
    ): ITransactionRequest => {
        const processedBodyAddresses = [...bodyAddresses];
        const processedStages = stages.map((stage) => {
            const { settings, bodies } = stage;
            const { type, requiredApprovals } = settings;

            const stageTiming = this.processStageTiming(settings, bodies);
            const stageApprovals = this.processStageApprovals(requiredApprovals, type, bodies);

            const resultType = type === ProcessStageType.NORMAL ? SppProposalType.APPROVAL : SppProposalType.VETO;

            const processedBodies = bodies.map((body) => ({
                addr: body.type === BodyType.NEW ? processedBodyAddresses.shift()! : body.address,
                resultType,
                tryAdvance: true,
                isManual: body.type === BodyType.EXTERNAL,
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

    private processStageApprovals = (requiredApprovals: number, stageType: ProcessStageType, bodies: ISetupBodyForm[]) => {
        // Stages with no bodies (timelock stages) do not require approvals
        const approvalThreshold = bodies.length > 0 && stageType === ProcessStageType.NORMAL ? requiredApprovals : 0;
        const vetoThreshold = bodies.length > 0 && stageType === ProcessStageType.OPTIMISTIC ? requiredApprovals : 0;

        return { approvalThreshold, vetoThreshold };
    };

    private processStageTiming = (settings: ISetupStageSettingsForm, bodies: ISetupBodyForm[]) => {
        const { votingPeriod, stageExpiration, earlyStageAdvance } = settings;

        const voteDuration = BigInt(dateUtils.durationToSeconds(votingPeriod));
        const processedStageExpiration =
            stageExpiration != null ? voteDuration + BigInt(dateUtils.durationToSeconds(stageExpiration)) : undefined;

        // Stages with no bodies (timelock stages) should not have early stage advance
        const minAdvance = bodies.length > 0 && earlyStageAdvance ? BigInt(0) : voteDuration;
        const maxAdvance = processedStageExpiration ?? this.defaultMaxAdvance;

        return { minAdvance, maxAdvance, voteDuration };
    };
}

export const sppTransactionUtils = new SppTransactionUtils();

import {
    type ICreateProcessFormData,
    type ICreateProcessFormStageTiming,
    ProcessStageType,
    ProposalCreationMode,
} from '@/modules/createDao/components/createProcessForm';
import type { ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import type { IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { createProposalUtils, type ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { IDao } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { dateUtils } from '@/shared/utils/dateUtils';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import { type IPluginSetupData, pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import { encodeAbiParameters, encodeFunctionData, type Hex } from 'viem';
import { sppPlugin } from '../../constants/sppPlugin';
import { SppProposalType } from '../../types';
import { sppPluginAbi, sppPluginSetupAbi } from './sppPluginAbi';

export interface ICreateSppProposalFormData extends ICreateProposalFormData, ICreateProposalEndDateForm {}

class SppTransactionUtils {
    // When stage expiration is not defined, we set a default max-advance to 100 years
    private defaultMaxAdvance = BigInt(dateUtils.durationToSeconds({ days: 36525, hours: 0, minutes: 0 }));

    // A special address for encoding permissions
    // See https://github.com/aragon/osx/blob/main/packages/contracts/src/core/permission/PermissionManager.sol#L23
    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';

    private permissionIds = {
        rootPermission: 'ROOT_PERMISSION',
        createProposalPermission: 'CREATE_PROPOSAL_PERMISSION',
        executePermission: 'EXECUTE_PERMISSION',
    };

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

    buildInstallPluginsActions = (values: ICreateProcessFormData, setupData: IPluginSetupData[], dao: IDao) => {
        const daoAddress = dao.address as Hex;
        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;

        // The SPP plugin is the one prepared first, the setupData array contains the data for the SPP plugin as the first element.
        const [sppAddress, ...pluginAddresses] = setupData.map((data) => data.pluginAddress);
        const [sppSetupData, ...pluginSetupData] = setupData;

        const grantRootPermissionAction = permissionTransactionUtils.buildGrantPermissionTransaction({
            where: daoAddress,
            who: pluginSetupProcessor,
            what: this.permissionIds.rootPermission,
            to: daoAddress,
        });

        const applyInstallationActions = pluginTransactionUtils.setupDataToActions(setupData, dao);
        const updateStagesAction = this.buildUpdateStagesTransaction(values, sppAddress, pluginAddresses);
        const updateCreateProposalRulesAction = this.buildUpdateRulesTransaction(values, sppSetupData, pluginSetupData);

        const pluginPermissionActions = pluginSetupData
            .map((data) => this.buildBodyPermissionActions(data, daoAddress, sppAddress))
            .flat();

        const revokeRootPermissionAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: pluginSetupProcessor,
            what: this.permissionIds.rootPermission,
            to: daoAddress,
        });

        return [
            grantRootPermissionAction,
            ...applyInstallationActions,
            updateStagesAction,
            updateCreateProposalRulesAction,
            ...pluginPermissionActions,
            revokeRootPermissionAction,
        ].filter((action) => action != null);
    };

    private buildBodyPermissionActions = (pluginData: IPluginSetupData, daoAddress: Hex, sppAddress: Hex) => {
        const { pluginAddress: bodyAddress } = pluginData;

        // No address should be able to create proposals directly on sub-plugins
        const revokePluginCreateProposalAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: bodyAddress,
            who: this.anyAddress,
            what: this.permissionIds.createProposalPermission,
            to: daoAddress,
        });

        // Allow SPP to create proposals on sub-plugins
        const grantSppCreateProposalAction = permissionTransactionUtils.buildGrantPermissionTransaction({
            where: bodyAddress,
            who: sppAddress,
            what: this.permissionIds.createProposalPermission,
            to: daoAddress,
        });

        // Sub-plugin should not have execute permission on the DAO, only SPP should have execute permission
        const revokeExecutePermission = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: bodyAddress,
            what: this.permissionIds.executePermission,
            to: daoAddress,
        });

        return [revokePluginCreateProposalAction, grantSppCreateProposalAction, revokeExecutePermission];
    };

    private buildUpdateRulesTransaction = (
        values: ICreateProcessFormData,
        sppSetupData: IPluginSetupData,
        pluginSetupData: IPluginSetupData[],
    ) => {
        const { permissions, stages } = values;
        const { proposalCreationBodies, proposalCreationMode } = permissions;

        const sppRuleConditionContract = sppSetupData.preparedSetupData.helpers[0];

        if (proposalCreationMode === ProposalCreationMode.ANY_WALLET) {
            return undefined;
        }

        const sppBodies = stages.flatMap((stage) => stage.bodies);
        const conditionAddresses = sppBodies.reduce<string[]>((current, body, bodyIndex) => {
            const isBodyAllowed = proposalCreationBodies.find((bodySettings) => bodySettings.bodyId === body.id);
            const bodyConditionAddress = pluginSetupData[bodyIndex].preparedSetupData.helpers[0];

            return isBodyAllowed ? [...current, bodyConditionAddress] : current;
        }, []);

        const conditionRules = permissionTransactionUtils.buildRuleConditions(conditionAddresses, []);

        const transactionData = encodeFunctionData({
            abi: sppPluginAbi,
            functionName: 'updateRules',
            args: [conditionRules],
        });

        return { to: sppRuleConditionContract, data: transactionData, value: '0' };
    };

    private buildUpdateStagesTransaction = (values: ICreateProcessFormData, sppAddress: Hex, bodyAddresses: Hex[]) => {
        const { stages } = values;

        const processedBodyAddresses = [...bodyAddresses];
        const processedStages = stages.map((stage) => {
            const { type, bodies, timing, requiredApprovals } = stage;

            const stageTiming = this.processStageTiming(timing, type);
            const stageApprovals = this.processStageApprovals(requiredApprovals, type);

            const resultType = type === ProcessStageType.NORMAL ? SppProposalType.APPROVAL : SppProposalType.VETO;

            const bodySettings = { isManual: false, tryAdvance: true };
            const processedBodies = bodies.map(() => ({
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

        return { to: sppAddress, data: transactionData, value: '0' };
    };

    private processStageApprovals = (requiredApprovals: number, stageType: ProcessStageType) => {
        const approvalThreshold = stageType === ProcessStageType.NORMAL ? requiredApprovals : 0;
        const vetoThreshold = stageType === ProcessStageType.OPTIMISTIC ? requiredApprovals : 0;

        return { approvalThreshold, vetoThreshold };
    };

    private processStageTiming = (timing: ICreateProcessFormStageTiming, stageType: ProcessStageType) => {
        const { votingPeriod, stageExpiration, earlyStageAdvance } = timing;

        const isTimelockStage = stageType === ProcessStageType.TIMELOCK;

        const processedVotingPeriod = BigInt(dateUtils.durationToSeconds(votingPeriod));
        const voteDuration = isTimelockStage ? BigInt(0) : processedVotingPeriod;

        const minAdvance = earlyStageAdvance ? BigInt(0) : processedVotingPeriod;
        const maxAdvance =
            stageExpiration != null
                ? voteDuration + BigInt(dateUtils.durationToSeconds(stageExpiration))
                : this.defaultMaxAdvance;

        return { minAdvance, maxAdvance, voteDuration };
    };
}

export const sppTransactionUtils = new SppTransactionUtils();

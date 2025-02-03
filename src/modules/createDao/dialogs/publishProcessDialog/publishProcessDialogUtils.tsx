import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginUtils } from '@/shared/utils/pluginUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, type Hex, keccak256, toBytes, zeroHash } from 'viem';
import { GovernanceSlotId } from '../../../governance/constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../../governance/types';
import { type ICreateProcessFormData } from '../../components/createProcessForm';
import { type IPluginSetupData, prepareProcessDialogUtils } from '../prepareProcessDialog/prepareProcessDialogUtils';
import { daoAbi } from './abi/daoAbi';

export interface IBuildTransactionParams {
    /**
     * Create-process form values.
     */
    values: ICreateProcessFormData;
    /**
     * DAO to install the plugins for.
     */
    dao: IDao;
    /**
     * Plugin used a target for creating the proposal.
     */
    plugin: IDaoPlugin;
    /**
     * Address list of the plugins to be installed.
     */
    setupData: IPluginSetupData[];
    /**
     * CID of the proposal metadata pinned on IPFS.
     */
    metadataCid: string;
}

export interface IConditionRule {
    id: number;
    op: number;
    value: bigint | string;
    permissionId: string;
}

export interface IUpdatePermissionParams {
    where: Hex;
    who: Hex;
    what: string;
    to: Hex;
}

export interface IUpdatePermissionWithConditionParams extends IUpdatePermissionParams {
    condition: Hex;
}

class PublishProcessDialogUtils {
    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';

    private permissionIds = {
        applyMultiTargetPermission: 'ROOT_PERMISSION', // TODO: failing without root-permission
        createProposalPermission: 'CREATE_PROPOSAL_PERMISSION',
        executePermission: 'EXECUTE_PERMISSION',
    };

    private defaultMaxAdvance = BigInt(dateUtils.durationToSeconds({ days: 36500, hours: 0, minutes: 0 })); // 10 years

    // // Identifiers of rule conditions (see https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L12)
    private ruleConditionId = {
        condition: 202,
        logicOperation: 203,
    };

    // // Operations for conditions (see https://github.com/aragon/osx-commons/blob/develop/contracts/src/permission/condition/extensions/RuledCondition.sol#L43)
    private ruleConditionOperator = {
        eq: 1,
        or: 10,
    };

    prepareProposalMetadata = () => {
        const title = 'Apply plugin installation';
        const summary = 'This proposal applies the plugin installation to create the new process';

        return { title, summary };
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, dao, setupData, plugin, metadataCid } = params;

        const proposalMetadata = transactionUtils.cidToHex(metadataCid);

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const proposalActions = this.buildInstallActions(values, setupData, dao.address as Hex);

        const buildDataParams: IBuildCreateProposalDataParams = {
            actions: proposalActions,
            metadata: proposalMetadata,
            values: {} as IBuildCreateProposalDataParams['values'],
        };

        const transactionData = buildDataFunction(buildDataParams);

        const transaction: TransactionDialogPrepareReturn = {
            to: plugin.address as Hex,
            data: transactionData,
        };

        return Promise.resolve(transaction);
    };

    private buildInstallActions = (values: ICreateProcessFormData, setupData: IPluginSetupData[], daoAddress: Hex) => {
        const pluginAddresses = setupData.map((data) => data.pluginAddress);

        const grantMultiTargetPermissionAction = this.buildGrantPermissionTransaction({
            where: daoAddress,
            who: prepareProcessDialogUtils.pspRepoAddress,
            what: this.permissionIds.applyMultiTargetPermission,
            to: daoAddress,
        });
        const applyInstallationActions = pluginUtils.buildApplyInstallationTransactions(setupData, daoAddress);
        const updateStagesAction = sppTransactionUtils.buildUpdateStagesTransaction(values, pluginAddresses);
        const updateCreateProposalRulesAction = sppTransactionUtils.buildUpdateRulesTransaction(values, setupData);

        // Skip first setupData item as it is related to the SPP plugin
        const pluginPermissionActions = setupData.slice(1).map((pluginData) => {
            const { pluginAddress: bodyAddress } = pluginData;

            // No one should be able to create proposals directly on sub-plugins
            const revokePluginCreateProposalAction = this.buildRevokePermissionTransaction({
                where: bodyAddress,
                who: this.anyAddress,
                what: this.permissionIds.createProposalPermission,
                to: daoAddress,
            });

            // Allow SPP to create proposals on sub-plugins
            const grantSppCreateProposalAction = this.buildGrantPermissionTransaction({
                where: bodyAddress,
                who: pluginAddresses[0], // SPP address
                what: this.permissionIds.createProposalPermission,
                to: daoAddress,
            });

            // Sub-plugin shouldn't have execute permission as SPP will already have it
            const revokeExecutePermission = this.buildRevokePermissionTransaction({
                where: daoAddress,
                who: bodyAddress,
                what: this.permissionIds.executePermission,
                to: daoAddress,
            });

            return [revokePluginCreateProposalAction, grantSppCreateProposalAction, revokeExecutePermission];
        });

        const revokeMultiTargetPermissionAction = this.buildRevokePermissionTransaction({
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

    private buildGrantPermissionTransaction = (params: IUpdatePermissionParams) => {
        const { where, who, what, to } = params;
        const transactionData = encodeFunctionData({
            abi: daoAbi,
            functionName: 'grant',
            args: [where, who, keccak256(toBytes(what))],
        });

        return { to, data: transactionData, value: '0' };
    };

    private buildRevokePermissionTransaction = (params: IUpdatePermissionParams) => {
        const { where, who, what, to } = params;
        const transactionData = encodeFunctionData({
            abi: daoAbi,
            functionName: 'revoke',
            args: [where, who, keccak256(toBytes(what))],
        });

        return { to, data: transactionData, value: '0' };
    };

    buildCreateProposalRuleConditions = (
        conditionAddresses: string[],
        conditionRules: IConditionRule[],
    ): IConditionRule[] => {
        if (!conditionAddresses.length) {
            return conditionRules;
        }

        if (conditionAddresses.length === 1) {
            return [...conditionRules, this.addressToCondition(conditionAddresses[0])];
        }

        const conditionAddress = conditionAddresses.pop()!;
        const { logicOperation } = this.ruleConditionId;
        const { or } = this.ruleConditionOperator;

        const baseIndex = conditionRules.length * 2;
        const value = this.encodeLogicalOperator(baseIndex + 1, baseIndex + 2);
        const newCondition = { id: logicOperation, op: or, value, permissionId: zeroHash };

        return [
            ...this.buildCreateProposalRuleConditions(conditionAddresses, [...conditionRules, newCondition]),
            this.addressToCondition(conditionAddress),
        ];
    };

    private encodeLogicalOperator = (firstIndex: number, secondIndex: number) =>
        BigInt(firstIndex) + (BigInt(secondIndex) << BigInt(32));

    private addressToCondition = (address: string): IConditionRule => ({
        id: this.ruleConditionId.condition,
        op: this.ruleConditionOperator.eq,
        value: address,
        permissionId: zeroHash,
    });
}

export const publishProcessDialogUtils = new PublishProcessDialogUtils();

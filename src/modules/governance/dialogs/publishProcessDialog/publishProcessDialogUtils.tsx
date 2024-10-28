import { SppProposalType } from '@/plugins/sppPlugin/types';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import type { TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { dateUtils } from '@/shared/utils/dateUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { encodeAbiParameters, encodeFunctionData, type Hex, keccak256, toBytes } from 'viem';
import type { ICreateProcessFormData } from '../../components/createProcessForm';
import { GovernanceSlotId } from '../../constants/moduleSlots';
import type { IBuildCreateProposalDataParams } from '../../types';
import { type IPluginSetupData, prepareProcessDialogUtils } from '../prepareProcessDialog/prepareProcessDialogUtils';
import { daoAbi } from './abi/daoAbi';
import { pluginSetupProcessorAbi } from './abi/pluginSetupProcessorAbi';
import { sppPluginAbi } from './abi/sppPluginAbi';

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

export interface IUpdatePermissionParams {
    where: Hex;
    who: Hex;
    what: string;
    to: Hex;
}

class PublishProcessDialogUtils {
    private anyAddress: Hex = '0xffffffffffffffffffffffffffffffffffffffff';

    private permissionIds = {
        applyMultiTargetPermission: 'ROOT_PERMISSION', // TODO: failing without root-permission
        createProposalPermission: 'CREATE_PROPOSAL_PERMISSION',
        executePermission: 'EXECUTE_PERMISSION',
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

        return transaction;
    };

    private buildInstallActions = (values: ICreateProcessFormData, setupData: IPluginSetupData[], daoAddress: Hex) => {
        const pluginAddresses = setupData.map((data) => data.pluginAddress);

        const grantMultiTargetPermissionAction = this.buildGrantPermissionTransaction({
            where: daoAddress,
            who: prepareProcessDialogUtils.pspRepoAddress,
            what: this.permissionIds.applyMultiTargetPermission,
            to: daoAddress,
        });
        const applyInstallationActions = this.buildApplyInstallationTransactions(setupData, daoAddress);
        const updateStagesAction = this.buildUpdateStagesTransaction(values, pluginAddresses);

        const multisigPermissionActions = values.stages
            .flatMap((stage) => stage.bodies)
            .map((body, index) => {
                if (body.governanceType === 'tokenVoting') {
                    return undefined;
                }

                // Add one to index as the setupData on first index is the SPP one
                const { pluginAddress: bodyAddress } = setupData[index + 1];

                // No one should be able to create proposals directly to multisig
                const revokeMultisigCreateProposalAction = this.buildRevokePermissionTransaction({
                    where: bodyAddress,
                    who: this.anyAddress,
                    what: this.permissionIds.createProposalPermission,
                    to: daoAddress,
                });

                // Allow SPP to create proposals to multisig
                const grantSppCreateProposalAction = this.buildGrantPermissionTransaction({
                    where: bodyAddress,
                    who: pluginAddresses[0], // SPP address
                    what: this.permissionIds.createProposalPermission,
                    to: daoAddress,
                });

                // Multisig shouldn't have execute permission as SPP will already have it
                const revokeExecutePermission = this.buildRevokePermissionTransaction({
                    where: daoAddress,
                    who: bodyAddress,
                    what: this.permissionIds.executePermission,
                    to: daoAddress,
                });

                return [revokeMultisigCreateProposalAction, grantSppCreateProposalAction, revokeExecutePermission];
            })
            .filter((action) => action != null);

        const grantCreateProposalActions = this.buildCreateProposalPermissionActions(
            values,
            pluginAddresses,
            daoAddress,
        );

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
            ...multisigPermissionActions.flat(),
            ...grantCreateProposalActions,
            revokeMultiTargetPermissionAction,
        ];
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

    private buildApplyInstallationTransactions = (setupData: IPluginSetupData[], daoAddress: Hex) => {
        const installactionActions = setupData.map((data) => {
            const { pluginSetupRepo, versionTag, pluginAddress, preparedSetupData } = data;
            const { permissions, helpers } = preparedSetupData;

            const transactionData = encodeFunctionData({
                abi: pluginSetupProcessorAbi,
                functionName: 'applyInstallation',
                args: [
                    daoAddress,
                    {
                        pluginSetupRef: { versionTag, pluginSetupRepo },
                        plugin: pluginAddress,
                        permissions,
                        helpersHash: this.hashHelpers(helpers),
                    },
                ],
            });

            return { to: prepareProcessDialogUtils.pspRepoAddress, data: transactionData, value: '0' };
        });

        return installactionActions;
    };

    private buildUpdateStagesTransaction = (values: ICreateProcessFormData, pluginAddresses: Hex[]) => {
        const { stages } = values;
        const [sppAddress, ...bodyAddresses] = pluginAddresses;

        const processedStages = stages.map((stage) => {
            const plugins = stage.bodies.map(() => {
                const pluginAddress = bodyAddresses.shift()!;

                return {
                    pluginAddress,
                    isManual: false,
                    allowedBody: pluginAddress,
                    resultType: stage.type === 'normal' ? SppProposalType.APPROVAL : SppProposalType.VETO,
                };
            });

            return {
                plugins,
                minAdvance: stage.earlyStageAdvance ? BigInt(0) : dateUtils.durationToSeconds(stage.votingPeriod),
                maxAdvance: dateUtils.durationToSeconds(stage.stageExpiration ?? { days: 36500, hours: 0, minutes: 0 }),
                voteDuration: dateUtils.durationToSeconds(stage.votingPeriod),
                approvalThreshold: stage.type === 'normal' ? stage.requiredApprovals : 0,
                vetoThreshold: stage.type === 'normal' ? 0 : stage.requiredApprovals,
            };
        });

        const transactionData = encodeFunctionData({
            abi: sppPluginAbi,
            functionName: 'updateStages',
            args: [processedStages],
        });

        return { to: sppAddress, data: transactionData, value: '0' };
    };

    private buildCreateProposalPermissionActions = (
        values: ICreateProcessFormData,
        pluginAddresses: Hex[],
        daoAddress: Hex,
    ) => {
        const memberAddresses = values.stages
            .flatMap((stage) => stage.bodies)
            .flatMap((body) => body.members)
            .map((member) => member.address as Hex);

        const grantCreateProposalPermissions = memberAddresses.map((memberAddress) => {
            const grantCreateProposalAction = this.buildGrantPermissionTransaction({
                where: pluginAddresses[0], // SPP address
                who: memberAddress,
                what: this.permissionIds.createProposalPermission,
                to: daoAddress,
            });

            return grantCreateProposalAction;
        });

        return grantCreateProposalPermissions;
    };

    private hashHelpers = (helpers: readonly Hex[]): Hex =>
        keccak256(encodeAbiParameters([{ type: 'address[]' }], [helpers]));
}

export const publishProcessDialogUtils = new PublishProcessDialogUtils();

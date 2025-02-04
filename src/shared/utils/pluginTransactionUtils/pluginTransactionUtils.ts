import {
    ProposalCreationMode,
    type ICreateProcessFormBody,
    type ICreateProcessFormData,
} from '@/modules/createDao/components/createProcessForm';
import { pluginSetupProcessorAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/pluginSetupProcessorAbi';

import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { type IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { multisigTransactionUtils } from '@/plugins/multisigPlugin/utils/multisigTransactionUtils';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { tokenTransactionUtils } from '@/plugins/tokenPlugin/utils/tokenTransactionUtils';
import { type IDao, type IDaoPlugin } from '@/shared/api/daoService';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, parseEventLogs, type Hex, type TransactionReceipt } from 'viem';

export interface IPrepareProcessMetadata {
    /**
     * Metadata CID of the proposal.
     */
    proposal: string;
    /**
     * Metadata CID of all process plugins ordered by stage and order of body inside the stage.
     */
    plugins: string[];
    /**
     * Metadata CID for the SPP plugin.
     */
    spp: string;
}

export interface IBuildTransactionParams {
    /**
     * Values of the create-proposal form.
     */
    values: ICreateProcessFormData;
    /**
     * Metadata structure for the process.
     */
    processMetadata: IPrepareProcessMetadata;
    /**
     * Plugin used a target for creating the proposal.
     */
    plugin: IDaoPlugin;
    /**
     * DAO to install the plugins to.
     */
    dao: IDao;
}

export interface IPluginRepoInfo {
    /**
     * Address of the plugin repo.
     */
    address: Hex;
    /**
     * Version of the plugin to be used.
     */
    version: { release: number; build: number };
}

export interface IPluginSetupDataPermission {
    operation: number;
    where: Hex;
    who: Hex;
    condition: Hex;
    permissionId: Hex;
}

export interface IPluginSetupData {
    pluginAddress: Hex;
    pluginSetupRepo: Hex;
    versionTag: { release: number; build: number };
    preparedSetupData: { helpers: readonly Hex[]; permissions: readonly IPluginSetupDataPermission[] };
}

export class PluginTransactionUtils {
    pspRepoAddress: Hex = '0x9e99D11b513dD2cc5e117a5793412106502FF04B';

    globalExecutor: Hex = '0x67744773b8C29aaDc8a11010C09306c0029219Ff';

    preparePluginMetadata = (plugin: ICreateProcessFormBody) => {
        const { name, description, resources: links } = plugin;

        return { name, description, links };
    };

    prepareProposalMetadata = () => {
        const title = 'Prepare plugin installation';
        const summary = 'This proposal prepares the installation of all plugins';

        return { title, summary };
    };

    buildPrepareInstallActions = (
        values: ICreateProcessFormData,
        daoAddress: Hex,
        processMetadata: IPrepareProcessMetadata,
    ) => {
        const { stages, permissions } = values;
        const { proposalCreationBodies, proposalCreationMode } = permissions;

        const sppMetadata = transactionUtils.cidToHex(processMetadata.spp);
        const pluginsMetadata = processMetadata.plugins.map((cid) => transactionUtils.cidToHex(cid));

        const sppInstallData = sppTransactionUtils.buildPrepareSppInstallData(sppMetadata, daoAddress);
        const pluginsInstallData = stages.map((stage) => {
            const installData = stage.bodies.map((body) => {
                const pluginMetadata = pluginsMetadata.shift()!;
                const permissionSettings =
                    proposalCreationMode === ProposalCreationMode.ANY_WALLET
                        ? undefined
                        : proposalCreationBodies.find((bodyPermissions) => bodyPermissions.bodyId === body.id);

                return body.governanceType === 'multisig'
                    ? multisigTransactionUtils.buildPrepareMultisigInstallData(
                          body,
                          pluginMetadata,
                          daoAddress,
                          permissionSettings,
                      )
                    : tokenTransactionUtils.buildPrepareTokenInstallData(
                          body,
                          pluginMetadata,
                          daoAddress,
                          stage,
                          permissionSettings,
                      );
            });

            return installData;
        });

        const installActions = [sppInstallData, ...pluginsInstallData.flat()].map((data) =>
            this.installDataToAction(data),
        );

        return installActions;
    };

    buildTransaction = (params: IBuildTransactionParams) => {
        const { values, processMetadata, plugin, dao } = params;

        const proposalMetadata = transactionUtils.cidToHex(processMetadata.proposal);

        const buildDataFunction = pluginRegistryUtils.getSlotFunction<IBuildCreateProposalDataParams, Hex>({
            pluginId: plugin.subdomain,
            slotId: GovernanceSlotId.GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA,
        })!;

        const proposalActions = this.buildPrepareInstallActions(values, dao.address as Hex, processMetadata);
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

    getPluginSetupData = (receipt: TransactionReceipt) => {
        const { logs } = receipt;

        const installationPreparedLogs = parseEventLogs({
            abi: pluginSetupProcessorAbi,
            eventName: 'InstallationPrepared',
            logs,
        });

        const pluginSetupData: IPluginSetupData[] = installationPreparedLogs.map((log) => ({
            pluginAddress: log.args.plugin,
            pluginSetupRepo: log.args.pluginSetupRepo,
            versionTag: log.args.versionTag,
            preparedSetupData: log.args.preparedSetupData,
        }));

        return pluginSetupData;
    };

    buildPrepareInstallationData = (pluginRepo: IPluginRepoInfo, data: Hex, daoAddress: Hex) => {
        const pluginSetupRef = { pluginSetupRepo: pluginRepo.address, versionTag: pluginRepo.version };
        const transactionData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'prepareInstallation',
            args: [daoAddress, { pluginSetupRef, data }],
        });

        return transactionData;
    };

    installDataToAction = (data: Hex) => ({ to: this.pspRepoAddress, data, value: '0' });
}

export const pluginTransactionUtils = new PluginTransactionUtils();

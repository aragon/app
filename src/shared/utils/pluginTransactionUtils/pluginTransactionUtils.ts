import {
    ProposalCreationMode,
    type ICreateProcessFormBody,
    type ICreateProcessFormData,
} from '@/modules/createDao/components/createProcessForm';
import { pluginSetupProcessorAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/pluginSetupProcessorAbi';
import {
    type IPluginRepoInfo,
    type IPluginSetupData,
    type IPrepareProcessMetadata,
} from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { GovernanceSlotId } from '@/modules/governance/constants/moduleSlots';
import { type IBuildCreateProposalDataParams } from '@/modules/governance/types';
import { sppTransactionUtils } from '@/plugins/sppPlugin/utils/sppTransactionUtils';
import { type IDao, type IDaoPlugin } from '@/shared/api/daoService';
import { type TransactionDialogPrepareReturn } from '@/shared/components/transactionDialog';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { transactionUtils } from '@/shared/utils/transactionUtils';
import { encodeFunctionData, parseEventLogs, type Hex, type TransactionReceipt } from 'viem';

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

class PluginTransactionUtils {
    pspRepoAddress: Hex = '0x9e99D11b513dD2cc5e117a5793412106502FF04B';

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
                    ? this.buildPrepareMultisigInstallData(body, pluginMetadata, daoAddress, permissionSettings)
                    : this.buildPrepareTokenInstallData(body, pluginMetadata, daoAddress, stage, permissionSettings);
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

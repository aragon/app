import { pluginSetupProcessorAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/pluginSetupProcessorAbi';
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

    buildPrepareInstallationData = (pluginRepo: IPluginRepoInfo, data: Hex, daoAddress: Hex) => {
        const pluginSetupRef = { pluginSetupRepo: pluginRepo.address, versionTag: pluginRepo.version };
        const transactionData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'prepareInstallation',
            args: [daoAddress, { pluginSetupRef, data }],
        });

        return transactionData;
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
}

export const pluginTransactionUtils = new PluginTransactionUtils();

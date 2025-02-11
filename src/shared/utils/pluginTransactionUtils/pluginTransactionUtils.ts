import type { IDao, Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    encodeAbiParameters,
    encodeFunctionData,
    keccak256,
    parseEventLogs,
    type Hex,
    type TransactionReceipt,
} from 'viem';
import { pluginSetupProcessorAbi } from './abi/pluginSetupProcessorAbi';
import type { IPluginSetupData, IPluginSetupVersionTag } from './pluginTransactionUtils.api';

class PluginTransactionUtils {
    setupDataToActions = (setupData: IPluginSetupData[], dao: IDao) => {
        const { address, network } = dao;

        const actions = setupData.map((data) => {
            const transactionData = this.buildApplyInstallationData(data, address);

            return this.installDataToAction(transactionData, network);
        });

        return actions;
    };

    getPluginSetupData = (receipt: TransactionReceipt): IPluginSetupData[] => {
        const { logs } = receipt;

        const installationPreparedLogs = parseEventLogs({
            abi: pluginSetupProcessorAbi,
            eventName: 'InstallationPrepared',
            logs,
        });

        const pluginSetupData = installationPreparedLogs.map((log) => {
            const { plugin, pluginSetupRepo, versionTag, preparedSetupData } = log.args;

            return { pluginAddress: plugin, pluginSetupRepo, versionTag, preparedSetupData };
        });

        return pluginSetupData;
    };

    installDataToAction = (data: Hex, network: Network) => {
        const { pluginSetupProcessor } = networkDefinitions[network].addresses;

        return { to: pluginSetupProcessor, data, value: '0' };
    };

    buildPrepareInstallationData = (
        pluginAddress: Hex,
        pluginVersion: IPluginSetupVersionTag,
        data: Hex,
        daoAddress: Hex,
    ) => {
        const pluginSetupRef = { pluginSetupRepo: pluginAddress, versionTag: pluginVersion };
        const transactionData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'prepareInstallation',
            args: [daoAddress, { pluginSetupRef, data }],
        });

        return transactionData;
    };

    private buildApplyInstallationData = (setupData: IPluginSetupData, daoAddress: string) => {
        const { pluginSetupRepo, versionTag, pluginAddress, preparedSetupData } = setupData;
        const { permissions, helpers } = preparedSetupData;

        const helpersHash = this.hashHelpers(helpers);
        const pluginSetupRef = { versionTag, pluginSetupRepo };

        const transactionData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'applyInstallation',
            args: [daoAddress as Hex, { pluginSetupRef, plugin: pluginAddress, permissions, helpersHash }],
        });

        return transactionData;
    };

    private hashHelpers = (helpers: readonly Hex[]): Hex =>
        keccak256(encodeAbiParameters([{ type: 'address[]' }], [helpers]));
}

export const pluginTransactionUtils = new PluginTransactionUtils();

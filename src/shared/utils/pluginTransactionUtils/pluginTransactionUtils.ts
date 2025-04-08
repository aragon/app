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
import { permissionTransactionUtils } from '../permissionTransactionUtils';
import type { ITransactionRequest } from '../transactionUtils';
import { pluginSetupProcessorAbi } from './abi/pluginSetupProcessorAbi';
import type {
    IBuildApplyPluginsInstallationActionsParams,
    IPluginSetupData,
    IPluginSetupVersionTag,
} from './pluginTransactionUtils.api';

class PluginTransactionUtils {
    // Specifies the type of operation to perform
    // See https://github.com/aragon/osx-commons/blob/main/contracts/src/plugin/IPlugin.sol#L18
    private targetOperation = {
        call: 0,
        delegateCall: 1,
    };

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

    installDataToAction = (data: Hex, network: Network): ITransactionRequest => {
        const { pluginSetupProcessor } = networkDefinitions[network].addresses;

        return { to: pluginSetupProcessor, data, value: BigInt(0) };
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

    getPluginTargetConfig = (dao: IDao, isAdvancedGovernace?: boolean) => {
        const { globalExecutor } = networkDefinitions[dao.network].addresses;

        const target = isAdvancedGovernace ? globalExecutor : (dao.address as Hex);
        const operation = isAdvancedGovernace ? this.targetOperation.delegateCall : this.targetOperation.call;

        return { target, operation };
    };

    buildApplyPluginsInstallationActions = (
        params: IBuildApplyPluginsInstallationActionsParams,
    ): ITransactionRequest[] => {
        const { dao, setupData, actions = [] } = params;
        const daoAddress = dao.address as Hex;

        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;

        // Temporarily grant the ROOT_PERMISSION to the plugin setup processor contract.
        const grantRootPermissionAction = permissionTransactionUtils.buildGrantPermissionTransaction({
            where: daoAddress,
            who: pluginSetupProcessor,
            what: permissionTransactionUtils.permissionIds.rootPermission,
            to: daoAddress,
        });

        // Build the apply installation actions
        const applyInstallationActions = this.setupDataToActions(setupData, dao);

        // Revoke the temporarily granted ROOT_PERMISSION to the plugin setup processor contract.
        const revokeRootPermissionAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: pluginSetupProcessor,
            what: permissionTransactionUtils.permissionIds.rootPermission,
            to: daoAddress,
        });

        return [grantRootPermissionAction, ...applyInstallationActions, ...actions, revokeRootPermissionAction];
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

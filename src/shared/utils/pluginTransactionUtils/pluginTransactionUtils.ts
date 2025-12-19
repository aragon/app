import {
    encodeAbiParameters,
    encodeFunctionData,
    type Hex,
    keccak256,
    parseEventLogs,
    type TransactionReceipt,
} from 'viem';
import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IPluginInfo } from '@/shared/types';
import { permissionTransactionUtils } from '../permissionTransactionUtils';
import { pluginRegistryUtils } from '../pluginRegistryUtils';
import type { ITransactionRequest } from '../transactionUtils';
import { versionComparatorUtils } from '../versionComparatorUtils';
import { pluginSetupProcessorAbi } from './abi/pluginSetupProcessorAbi';
import type {
    IBuildApplyPluginsInstallationActionsParams,
    IBuildApplyPluginsUpdateActionsParams,
    IBuildApplyPluginUninstallationActionParams,
    IPluginInstallationSetupData,
    IPluginSetupVersionTag,
    IPluginUninstallSetupData,
    IPluginUpdateSetupData,
} from './pluginTransactionUtils.api';

class PluginTransactionUtils {
    // Specifies the type of operation to perform
    // See https://github.com/aragon/osx-commons/blob/main/contracts/src/plugin/IPlugin.sol#L18
    private targetOperation = {
        call: 0,
        delegateCall: 1,
    };

    getPluginInstallationSetupData = (
        receipt: TransactionReceipt,
    ): IPluginInstallationSetupData[] => {
        const { logs } = receipt;
        const eventName = 'InstallationPrepared';
        const installationPreparedLogs = parseEventLogs({
            abi: pluginSetupProcessorAbi,
            eventName,
            logs,
        });

        return installationPreparedLogs.map(({ args }) => ({
            ...args,
            pluginAddress: args.plugin,
        }));
    };

    getPluginUpdateSetupData = (
        receipt: TransactionReceipt,
    ): IPluginUpdateSetupData[] => {
        const { logs } = receipt;
        const eventName = 'UpdatePrepared';
        const installationPreparedLogs = parseEventLogs({
            abi: pluginSetupProcessorAbi,
            eventName,
            logs,
        });

        return installationPreparedLogs.map(({ args }) => ({
            pluginSetupRepo: args.pluginSetupRepo,
            versionTag: args.versionTag,
            preparedSetupData: args.preparedSetupData,
            initData: args.initData,
        }));
    };

    getPluginUninstallSetupData = (
        receipt: TransactionReceipt,
    ): IPluginUninstallSetupData => {
        const { logs } = receipt;
        const eventName = 'UninstallationPrepared';
        const uninstallationPreparedLog = parseEventLogs({
            abi: pluginSetupProcessorAbi,
            eventName,
            logs,
        })[0];
        const { pluginSetupRepo, versionTag, permissions, setupPayload } =
            uninstallationPreparedLog.args;

        return {
            pluginSetupRepo,
            versionTag,
            permissions,
            setupPayload,
            pluginAddress: setupPayload.plugin,
        };
    };

    buildPrepareInstallationData = (
        pluginAddress: Hex,
        versionTag: IPluginSetupVersionTag,
        data: Hex,
        dao: Hex,
    ) => {
        const pluginSetupRef = { pluginSetupRepo: pluginAddress, versionTag };
        const transactionData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'prepareInstallation',
            args: [dao, { pluginSetupRef, data }],
        });

        return transactionData;
    };

    buildPrepareUninstallData = (
        dao: IDao,
        plugin: IDaoPlugin,
        helpers: Hex[],
        data: Hex,
    ) => {
        const versionTag =
            versionComparatorUtils.normaliseComparatorInput(plugin)!;
        const pluginDefinitions = pluginRegistryUtils.getPlugin(
            plugin.interfaceType,
        )! as IPluginInfo;

        const pluginSetupRef = {
            pluginSetupRepo: pluginDefinitions.repositoryAddresses[dao.network],
            versionTag,
        };
        const setupPayload = {
            plugin: plugin.address as Hex,
            currentHelpers: helpers,
            data,
        };

        const transactionData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'prepareUninstallation',
            args: [dao.address as Hex, { pluginSetupRef, setupPayload }],
        });

        return transactionData;
    };

    getPluginTargetConfig = (dao: IDao, isAdvancedGovernance?: boolean) => {
        const { globalExecutor } = networkDefinitions[dao.network].addresses;

        const target = isAdvancedGovernance
            ? globalExecutor
            : (dao.address as Hex);
        const operation = isAdvancedGovernance
            ? this.targetOperation.delegateCall
            : this.targetOperation.call;

        return { target, operation };
    };

    buildApplyPluginsInstallationActions = (
        params: IBuildApplyPluginsInstallationActionsParams,
    ): ITransactionRequest[] => {
        const {
            dao,
            setupData,
            actions = [],
            executeConditionAddress,
        } = params;
        const daoAddress = dao.address as Hex;

        const { pluginSetupProcessor } =
            networkDefinitions[dao.network].addresses;

        // Temporarily grant the ROOT_PERMISSION to the plugin setup processor contract.
        const [grantRootTx, revokeRootTx] =
            permissionTransactionUtils.buildGrantRevokePermissionTransactions({
                where: daoAddress,
                who: pluginSetupProcessor,
                what: permissionTransactionUtils.permissionIds.rootPermission,
                to: daoAddress,
            });

        // If executeConditionAddress is provided, we need to revoke the execute permission and grant it with the condition.
        // The first plugin in the setupData is either the SPP or the plugin for basic governance processes.
        const needsExecuteCondition = executeConditionAddress != null;
        const executeWithConditionTransactions = needsExecuteCondition
            ? permissionTransactionUtils.buildExecuteConditionTransactions({
                  dao: daoAddress,
                  plugin: setupData[0].pluginAddress,
                  executeCondition: executeConditionAddress,
              })
            : [];

        const applyInstallationActions = setupData.map((data) =>
            this.setupInstallationDataToAction(data, dao),
        );

        return [
            grantRootTx,
            ...applyInstallationActions,
            ...actions,
            revokeRootTx,
            ...executeWithConditionTransactions,
        ];
    };

    buildApplyPluginUninstallationAction = (
        params: IBuildApplyPluginUninstallationActionParams,
    ): ITransactionRequest[] => {
        const { dao, setupData } = params;
        const { pluginSetupRepo, versionTag, permissions, pluginAddress } =
            setupData;

        const { pluginSetupProcessor } =
            networkDefinitions[dao.network].addresses;

        // Temporarily grant the ROOT_PERMISSION to the plugin setup processor contract.
        const [grantRootTx, revokeRootTx] =
            permissionTransactionUtils.buildGrantRevokePermissionTransactions({
                where: dao.address as Hex,
                who: pluginSetupProcessor,
                what: permissionTransactionUtils.permissionIds.rootPermission,
                to: dao.address as Hex,
            });

        const pluginSetupRef = { versionTag, pluginSetupRepo };
        const uninstallData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'applyUninstallation',
            args: [
                dao.address as Hex,
                { plugin: pluginAddress, pluginSetupRef, permissions },
            ],
        });

        const uninstallAction = {
            to: pluginSetupProcessor,
            data: uninstallData,
            value: BigInt(0),
        };

        return [grantRootTx, uninstallAction, revokeRootTx];
    };

    buildApplyPluginsUpdateActions = (
        params: IBuildApplyPluginsUpdateActionsParams,
    ): ITransactionRequest[] => {
        const { dao, plugins, setupData } = params;
        const daoAddress = dao.address as Hex;

        const requiresRootPermission = setupData.some(
            (data) => data.preparedSetupData.permissions.length > 0,
        );

        const applyUpdateTransactions = plugins.flatMap((plugin, index) =>
            this.buildApplyPluginUpdateAction(dao, plugin, setupData[index]),
        );

        if (requiresRootPermission) {
            // Grant ROOT_PERMISSION to the PSP contract if some plugin update requires permissions to be granted or revoked
            const [grantRootTx, revokeRootTx] =
                permissionTransactionUtils.buildGrantRevokePermissionTransactions(
                    {
                        where: daoAddress,
                        who: networkDefinitions[dao.network].addresses
                            .pluginSetupProcessor,
                        what: permissionTransactionUtils.permissionIds
                            .rootPermission,
                        to: daoAddress,
                    },
                );

            applyUpdateTransactions.unshift(grantRootTx);
            applyUpdateTransactions.push(revokeRootTx);
        }

        return applyUpdateTransactions;
    };

    private buildApplyPluginUpdateAction = (
        dao: IDao,
        plugin: IDaoPlugin,
        setupData: IPluginUpdateSetupData,
    ) => {
        const { pluginSetupProcessor } =
            networkDefinitions[dao.network].addresses;
        const daoAddress = dao.address as Hex;

        // Temporarily grant the UPGRADE_PLUGIN_PERMISSION to the plugin setup processor contract.
        const [grantUpgradeTx, revokeUpgradeTx] =
            permissionTransactionUtils.buildGrantRevokePermissionTransactions({
                where: plugin.address as Hex,
                who: pluginSetupProcessor,
                what: permissionTransactionUtils.permissionIds
                    .upgradePluginPermission,
                to: daoAddress,
            });

        const applyUpdateTransaction = this.setupUpdateDataToAction(
            dao,
            plugin,
            setupData,
        );

        return [grantUpgradeTx, applyUpdateTransaction, revokeUpgradeTx];
    };

    private setupUpdateDataToAction = (
        dao: IDao,
        plugin: IDaoPlugin,
        setupData: IPluginUpdateSetupData,
    ) => {
        const { pluginSetupRepo, versionTag, initData, preparedSetupData } =
            setupData;
        const { permissions, helpers } = preparedSetupData;

        const { pluginSetupProcessor } =
            networkDefinitions[dao.network].addresses;
        const helpersHash = this.hashHelpers(helpers);
        const pluginSetupRef = { versionTag, pluginSetupRepo };

        const transactionData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'applyUpdate',
            args: [
                dao.address as Hex,
                {
                    plugin: plugin.address as Hex,
                    pluginSetupRef,
                    initData,
                    permissions,
                    helpersHash,
                },
            ],
        });

        return {
            to: pluginSetupProcessor,
            data: transactionData,
            value: BigInt(0),
        };
    };

    private setupInstallationDataToAction = (
        setupData: IPluginInstallationSetupData,
        dao: IDao,
    ) => {
        const {
            pluginSetupRepo,
            versionTag,
            pluginAddress,
            preparedSetupData,
        } = setupData;
        const { permissions, helpers } = preparedSetupData;

        const { pluginSetupProcessor } =
            networkDefinitions[dao.network].addresses;
        const helpersHash = this.hashHelpers(helpers);
        const pluginSetupRef = { versionTag, pluginSetupRepo };

        const transactionData = encodeFunctionData({
            abi: pluginSetupProcessorAbi,
            functionName: 'applyInstallation',
            args: [
                dao.address as Hex,
                {
                    pluginSetupRef,
                    plugin: pluginAddress,
                    permissions,
                    helpersHash,
                },
            ],
        });

        return {
            to: pluginSetupProcessor,
            data: transactionData,
            value: BigInt(0),
        };
    };

    private hashHelpers = (helpers: readonly Hex[]): Hex =>
        keccak256(encodeAbiParameters([{ type: 'address[]' }], [helpers]));
}

export const pluginTransactionUtils = new PluginTransactionUtils();

import { pluginSetupProcessorAbi } from '@/modules/createDao/dialogs/prepareProcessDialog/abi/pluginSetupProcessorAbi';
import { type IPluginRepoInfo } from '@/shared/utils/pluginTransactionUtils/pluginTransactionUtils';
import { encodeFunctionData, type Hex } from 'viem';

class PluginInstallationUtils {
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
}

export const pluginInstallationUtils = new PluginInstallationUtils();

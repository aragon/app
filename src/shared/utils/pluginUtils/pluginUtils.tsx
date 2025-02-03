import {
    prepareProcessDialogUtils,
    type IPluginSetupData,
} from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import { pluginSetupProcessorAbi } from '@/modules/createDao/dialogs/publishProcessDialog/abi/pluginSetupProcessorAbi';
import { encodeAbiParameters, encodeFunctionData, keccak256, type Hex } from 'viem';

class PluginUtils {
    hashHelpers = (helpers: readonly Hex[]): Hex => keccak256(encodeAbiParameters([{ type: 'address[]' }], [helpers]));

    buildApplyInstallationTransactions = (setupData: IPluginSetupData[], daoAddress: Hex) => {
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
}

export const pluginUtils = new PluginUtils();

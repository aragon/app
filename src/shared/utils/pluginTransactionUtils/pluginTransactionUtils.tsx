import { prepareProcessDialogUtils } from '@/modules/createDao/dialogs/prepareProcessDialog/prepareProcessDialogUtils';
import type { IPluginSetupData } from '@/shared/types/pluginSetupData';
import { encodeAbiParameters, encodeFunctionData, keccak256, type Hex } from 'viem';
import { pluginSetupProcessorAbi } from './abi/pluginSetupProcessorAbi';

class PluginTransactionUtils {
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

export const pluginTransactionUtils = new PluginTransactionUtils();

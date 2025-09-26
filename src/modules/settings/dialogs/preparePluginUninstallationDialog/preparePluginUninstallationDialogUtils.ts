import type { IDao, IDaoPlugin } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { pluginRegistryUtils } from '@/shared/utils/pluginRegistryUtils';
import { pluginTransactionUtils } from '@/shared/utils/pluginTransactionUtils';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { Hex } from 'viem';
import { SettingsSlotId } from '../../constants/moduleSlots';
import type { IGetUninstallHelpersParams } from '../../types';

class PreparePluginUninstallationDialogUtils {
    buildPrepareUninstallationTransaction = (dao: IDao, plugin: IDaoPlugin): Promise<ITransactionRequest> => {
        const { pluginSetupProcessor } = networkDefinitions[dao.network].addresses;

        // Retrieve the plugin-specific helper addresses required to build the prepare-uninstallation transaction. The
        // returned array must exactly match the helper addresses that were defined during installation preparation of
        // the plugin.
        const getHelpersFunction = pluginRegistryUtils.getSlotFunction<IGetUninstallHelpersParams, Hex[]>({
            slotId: SettingsSlotId.SETTINGS_GET_UNINSTALL_HELPERS,
            pluginId: plugin.interfaceType,
        });

        const helpers = getHelpersFunction?.({ plugin }) ?? [];
        const prepareUninstallData = pluginTransactionUtils.buildPrepareUninstallData(dao, plugin, helpers, '0x');

        return Promise.resolve({ data: prepareUninstallData, value: BigInt(0), to: pluginSetupProcessor });
    };

    prepareApplyUninstallationProposalMetadata = (uninstallPlugin: IDaoPlugin, proposalPlugin: IDaoPlugin) => {
        const uninstallPluginInfo = `${daoUtils.getPluginName(uninstallPlugin)} (${uninstallPlugin.slug.toUpperCase()})`;
        const proposalPluginInfo = `${daoUtils.getPluginName(proposalPlugin)} (${proposalPlugin.slug.toUpperCase()})`;

        const title = `Uninstall ${uninstallPluginInfo} process`;
        const summary = [
            `If approved, this proposal will uninstall the ${uninstallPluginInfo} plugin. It will revoke the`,
            `plugin's permission to execute actions on the DAO's behalf. Vote in favor only if you're confident other`,
            `installed governance processes are enough for the DAO to function as intended. The current`,
            `${proposalPluginInfo} process will not be affected`,
        ].join(' ');

        return { title, summary };
    };
}

export const preparePluginUninstallationDialogUtils = new PreparePluginUninstallationDialogUtils();
